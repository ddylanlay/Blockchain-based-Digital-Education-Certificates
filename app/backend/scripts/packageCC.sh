#!/usr/bin/env bash

source scripts/utils.sh

CC_NAME=${1}
CC_SRC_PATH=${2}
CC_SRC_LANGUAGE=${3}
CC_VERSION=${4}

println "executing with the following"
println "- CC_NAME: ${C_GREEN}${CC_NAME}${C_RESET}"
println "- CC_SRC_PATH: ${C_GREEN}${CC_SRC_PATH}${C_RESET}"
println "- CC_SRC_LANGUAGE: ${C_GREEN}${CC_SRC_LANGUAGE}${C_RESET}"
println "- CC_VERSION: ${C_GREEN}${CC_VERSION}${C_RESET}"

FABRIC_CFG_PATH=$PWD/../../fabric-samples/test-network/config/

# import utils
. scripts/envVar.sh

function checkPrereqs() {
  jq --version > /dev/null 2>&1

  if [[ $? -ne 0 ]]; then
    errorln "jq command not found..."
    errorln
    errorln "Follow the instructions in the Fabric docs to install the prereqs"
    errorln "https://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html"
    exit 1
  fi
}

#check for prerequisites
checkPrereqs

## package the chaincode
infoln "Packaging chaincode..."
set -x
peer lifecycle chaincode package ${CC_NAME}.tar.gz --path ${CC_SRC_PATH} --lang ${CC_SRC_LANGUAGE} --label ${CC_NAME}_${CC_VERSION} >&log.txt
res=$?
{ set +x; } 2>/dev/null
cat log.txt
verifyResult $res "Chaincode packaging has failed"
successln "Chaincode is packaged"