/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Asset} from './asset';

// Role definitions - using attributes instead of MSP IDs for flexibility
enum UserRole {
    CA_ADMIN = 'ca_admin',
    STUDENT = 'student'
}

// Helper function to get user role from client identity attributes
function getUserRole(ctx: Context): UserRole {
    const clientIdentity = ctx.clientIdentity;

    try {
        // Try to get role from client identity attributes
        const roleAttr = clientIdentity.getAttributeValue('role');
        if (roleAttr === 'ca_admin') {
            return UserRole.CA_ADMIN;
        } else if (roleAttr === 'student') {
            return UserRole.STUDENT;
        }

        // Fallback: check MSP ID for basic role assignment
        const mspId = clientIdentity.getMSPID();
        if (mspId === 'Org1MSP') {
            // For demo purposes, assume Org1MSP users are admins
            return UserRole.CA_ADMIN;
        }

        // Default to student if no specific role found
        return UserRole.STUDENT;
    } catch (error) {
        console.log('Role detection error, defaulting to CA_ADMIN for Org1MSP:', error);
        return UserRole.CA_ADMIN;
    }
}

// Helper function to check if user has CA admin privileges
function isCAAdmin(ctx: Context): boolean {
    return getUserRole(ctx) === UserRole.CA_ADMIN;
}

// Helper function to check if user is a student
function isStudent(ctx: Context): boolean {
    return getUserRole(ctx) === UserRole.STUDENT;
}

@Info({title: 'AssetTransfer', description: 'Smart contract for trading assets'})
export class AssetTransferContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const assets: Asset[] = [
            {
                "ID": "CERT-001",
                "Owner": "John Smith",
                "department": "Computer Science",
                "academicYear": "2022-2023",
                "joinDate": "2019-09-01",
                "endDate": "2023-05-30",
                "certificateType": "Degree Certificate",
                "issueDate": "2023-06-15",
                "status": "issued",
                "txHash": "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t"
            },
            {
                "ID": "CERT-002",
                "Owner": "Emily Johnson",
                "department": "Electrical Engineering",
                "academicYear": "2022-2023",
                "joinDate": "2019-09-01",
                "endDate": "2023-05-30",
                "certificateType": "Degree Certificate",
                "issueDate": "2023-06-15",
                "status": "issued",
                "txHash": "0x9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a"
            }];

        for (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putState(asset.ID, Buffer.from(stringify(sortKeysRecursive(asset))));
            console.info(`Asset ${asset.ID} initialized`);
        }
    }

    @Transaction()
    public async CreateAsset(
        ctx: Context,
        id: string,
        owner: string,
        department: string,
        academicYear: string,
        joinDate: string,
        endDate: string,
        certificateType: string,
        issueDate: string,
        status: string,
        txHash: string
    ): Promise<void> {
        // Only CA admins can create assets (issue credentials)
        if (!isCAAdmin(ctx)) {
            throw new Error('Access denied: Only CA administrators can create credentials');
        }

        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        const asset = {
            ID: id,
            Owner: owner,
            department,
            academicYear,
            joinDate,
            endDate,
            certificateType,
            issueDate,
            status,
            txHash,
        };

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        console.info(`Asset ${id} created by CA admin`);
    }

    @Transaction(false)
    public async ReadAsset(ctx: Context, id: string): Promise<string> {
        const assetJSON = await ctx.stub.getState(id);
        if (assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    @Transaction()
    public async UpdateAssetStatus(
        ctx: Context,
        id: string,
        newStatus: string
    ): Promise<void> {
        // Only CA admins can update status
        if (!isCAAdmin(ctx)) {
            throw new Error('Access denied: Only CA administrators can update credential status');
        }

        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString) as Asset;
        asset.status = newStatus;
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        console.info(`Asset ${id} status updated to ${newStatus} by CA admin`);
    }

    @Transaction()
    public async UpdateAsset(
        ctx: Context,
        id: string,
        owner: string,
        department: string,
        academicYear: string,
        joinDate: string,
        endDate: string,
        certificateType: string,
        issueDate: string,
        status: string,
        txHash: string
    ): Promise<void> {
        // Only CA admins can update assets
        if (!isCAAdmin(ctx)) {
            throw new Error('Access denied: Only CA administrators can update credentials');
        }

        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        const updatedAsset = {
            ID: id,
            Owner: owner,
            department,
            academicYear,
            joinDate,
            endDate,
            certificateType,
            issueDate,
            status,
            txHash,
        };

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
        console.info(`Asset ${id} updated by CA admin`);
    }

    @Transaction()
    public async DeleteAsset(ctx: Context, id: string): Promise<void> {
        // Only CA admins can delete assets
        if (!isCAAdmin(ctx)) {
            throw new Error('Access denied: Only CA administrators can delete credentials');
        }

        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        await ctx.stub.deleteState(id);
        console.info(`Asset ${id} deleted by CA admin`);
    }

    @Transaction(false)
    @Returns('boolean')
    public async AssetExists(ctx: Context, id: string): Promise<boolean> {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON.length > 0;
    }

    @Transaction()
    public async TransferAsset(ctx: Context, id: string, newOwner: string): Promise<string> {
        // Only CA admins can transfer assets
        if (!isCAAdmin(ctx)) {
            throw new Error('Access denied: Only CA administrators can transfer credentials');
        }

        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString) as Asset;
        const oldOwner = asset.Owner;
        asset.Owner = newOwner;

        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        console.info(`Asset ${id} transferred from ${oldOwner} to ${newOwner} by CA admin`);
        return oldOwner;
    }

    @Transaction(false)
    @Returns('string')
    public async GetAllAssets(ctx: Context): Promise<string> {
        // Both CA admins and students can view all assets
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();

        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue) as Asset;
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    @Transaction(false)
    public async GetAssetHistory(ctx: Context, id: string): Promise<string> {
        // Both CA admins and students can view asset history
        try {
            const iterator = await ctx.stub.getHistoryForKey(id);
            const allResults = [];
            let result = await iterator.next();

            while (!result.done) {
                const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
                let record;
                try {
                    record = JSON.parse(strValue);
                } catch (err) {
                    console.log(err);
                    record = strValue;
                }
                allResults.push(record);
                result = await iterator.next();
            }
            return JSON.stringify(allResults);
        } catch (error) {
            console.log('GetAssetHistory error:', error);
            return JSON.stringify([]);
        }
    }

    // New function to get user role information
    @Transaction(false)
    public async GetUserRole(ctx: Context): Promise<string> {
        const role = getUserRole(ctx);
        const mspId = ctx.clientIdentity.getMSPID();

        return JSON.stringify({
            role: role,
            mspId: mspId,
            isCAAdmin: isCAAdmin(ctx),
            isStudent: isStudent(ctx)
        });
    }
}