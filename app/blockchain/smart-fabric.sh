set -e

COMMAND=$1

function checkNetworkHealth() {
    echo "Checking network health..."

    # Check if containers are running
    RUNNING_CONTAINERS=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(peer|orderer|couchdb)" | grep "Up" | wc -l)
    EXPECTED_CONTAINERS=5  # 2 peers + 1 orderer + 2 couchdb (adjust based on your setup)

    echo "Running containers: $RUNNING_CONTAINERS/$EXPECTED_CONTAINERS"

    if [ $RUNNING_CONTAINERS -lt $EXPECTED_CONTAINERS ]; then
        echo "Some containers are down. Network restart recommended."
        return 1
    fi

    # Check if peer CLI works
    if ! timeout 10 docker exec cli peer version > /dev/null 2>&1; then
        echo "ERROR: Peer CLI not responding. Network restart recommended."
        return 1
    fi

    # Check basic connectivity
    export PATH=${PWD}/../bin:$PATH
    export FABRIC_CFG_PATH=$PWD/../config/
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051

    if ! timeout 10 peer channel list > /dev/null 2>&1; then
        echo "ERROR: Cannot query channels. Network restart recommended."
        return 1
    fi

    echo "SUCCESS: Network appears healthy"
    return 0
}

function startOrResume() {
    cd fabric-samples/test-network

    echo "Starting/Resuming Fabric network..."

    # Check if network is already running
    if docker ps | grep -q "peer0.org1.example.com"; then
        echo "Network appears to be running. Checking health..."

        if checkNetworkHealth; then
            echo "SUCCESS: Network is healthy. Resuming work..."
            showNetworkStatus
            return 0
        else
            echo "WARNING: Network has issues. Attempting restart..."
            ./network.sh down
        fi
    fi

    echo "Starting fresh network..."
    ./network.sh up createChannel

    # Only deploy chaincode if not already deployed
    if ! peer chaincode query -C mychannel -n basic -c '{"Args":["GetAllAssets"]}' > /dev/null 2>&1; then
        echo "Deploying chaincode..."
        ./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-typescript -ccl typescript

        echo "Initializing ledger..."
        setupEnvironment
        initializeLedger
    else
        echo "Chaincode already deployed"
        setupEnvironment
    fi

    showNetworkStatus
}

function setupEnvironment() {
    export PATH=${PWD}/../bin:$PATH
    export FABRIC_CFG_PATH=$PWD/../config/
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
}

function initializeLedger() {
    # Check if ledger is empty
    ASSETS=$(peer chaincode query -C mychannel -n basic -c '{"Args":["GetAllAssets"]}' 2>/dev/null || echo "[]")

    if [ "$ASSETS" == "[]" ] || [ "$ASSETS" == "" ]; then
        echo "Initializing empty ledger with default assets..."
        peer chaincode invoke \
            -o localhost:7050 \
            --ordererTLSHostnameOverride orderer.example.com \
            --tls \
            --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
            -C mychannel \
            -n basic \
            --peerAddresses localhost:7051 \
            --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
            --peerAddresses localhost:9051 \
            --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
            --waitForEvent \
            -c '{"function":"InitLedger","Args":[]}'

    else
        echo "Ledger already contains data. Skipping initialization."
    fi
}

function showNetworkStatus() {
    echo ""
    echo "Network Status:"
    echo "=================="
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(peer|orderer|couchdb|NAMES)"
    echo ""

    setupEnvironment
    echo "Current Assets:"
    echo "=================="
    peer chaincode query -C mychannel -n basic -c '{"Args":["GetAllAssets"]}' | jq '.' 2>/dev/null || peer chaincode query -C mychannel -n basic -c '{"Args":["GetAllAssets"]}'
    echo ""

    echo "INFO: Network is ready for development!"
    echo "INFO: Your assets will persist until you run './network.sh down'"
}

function forceRestart() {
    cd fabric-samples/test-network
    echo "Forcing network restart..."
    ./network.sh down
    startOrResume
}

function softStop() {
    cd fabric-samples/test-network
    echo "Stopping network (containers will persist)..."
    docker-compose -f compose/compose-test-net.yaml -f compose/compose-couch.yaml stop
}

function resume() {
    cd fabric-samples/test-network
    echo "Resuming stopped network..."
    docker-compose -f compose/compose-test-net.yaml -f compose/compose-couch.yaml start
    sleep 5
    checkNetworkHealth
    showNetworkStatus
}

case $COMMAND in
    "start"|"up")
        startOrResume
        ;;
    "status"|"check")
        cd fabric-samples/test-network
        checkNetworkHealth && showNetworkStatus
        ;;
    "restart"|"force")
        forceRestart
        ;;
    "stop")
        softStop
        ;;
    "resume")
        resume
        ;;
    "down")
        cd fabric-samples/test-network
        ./network.sh down
        echo "STOP: Network stopped and data cleared"
        ;;
    *)
        echo "Smart Fabric Development Workflow"
        echo "================================="
        echo "Usage: $0 {start|status|restart|stop|resume|down}"
        echo ""
        echo "Commands:"
        echo "  start   - Intelligently start/resume network (preserves data)"
        echo "  status  - Check network health and show current state"
        echo "  restart - Force complete restart (loses data)"
        echo "  stop    - Stop containers but keep them (preserves data)"
        echo "  resume  - Resume stopped containers"
        echo "  down    - Complete shutdown and cleanup (loses data)"
        echo ""
        echo "WORKFLOW: Recommended daily workflow:"
        echo "   ./smart-fabric.sh start    # When you start working"
        echo "   ./smart-fabric.sh status   # Check if everything's working"
        echo "   ./smart-fabric.sh stop     # When you're done for the day (optional)"
        exit 1
        ;;
esac