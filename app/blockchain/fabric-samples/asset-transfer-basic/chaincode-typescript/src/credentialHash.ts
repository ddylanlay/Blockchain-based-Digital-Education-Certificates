/*
 * SPDX-License-Identifier: Apache-2.0
 */
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';

@Info({title: 'CredentialHash', description: 'Smart contract for storing credential hashes'})
export class CredentialHashContract extends Contract {

    @Transaction()
    public async StoreCredentialHash(
        ctx: Context,
        id: string,
        hash: string,
        studentWallet: string,
        universityWallet: string,
        issueDate: string,
        status: string
    ): Promise<void> {

        // Check if credential hash already exists
        const exists = await this.CredentialHashExists(ctx, id);
        if (exists) {
            throw new Error(`Credential hash ${id} already exists`);
        }

        // Create credential hash record (only metadata, no personal details)
        const credentialHash = {
            id: id,
            hash: hash,
            studentWallet: studentWallet,
            universityWallet: universityWallet,
            issueDate: issueDate,
            status: status,
            storedAt: new Date().toISOString()
        };

        // Store only hash and metadata on blockchain
        await ctx.stub.putState(id, Buffer.from(stringify(credentialHash)));
        console.log(`Credential hash ${id} stored successfully`);
    }

    @Transaction(false)
    public async GetCredentialHash(ctx: Context, id: string): Promise<string> {
        const hashJSON = await ctx.stub.getState(id);
        if (hashJSON.length === 0) {
            throw new Error(`Credential hash ${id} does not exist`);
        }
        return hashJSON.toString();
    }

    @Transaction(false)
    @Returns('boolean')
    public async CredentialHashExists(ctx: Context, id: string): Promise<boolean> {
        const hashJSON = await ctx.stub.getState(id);
        return hashJSON.length > 0;
    }

    @Transaction(false)
    public async VerifyCredentialHash(ctx: Context, id: string, providedHash: string): Promise<string> {
        const hashRecord = await this.GetCredentialHash(ctx, id);
        const record = JSON.parse(hashRecord);

        const verification = {
            isValid: record.hash === providedHash,
            storedHash: record.hash,
            providedHash: providedHash,
            studentWallet: record.studentWallet,
            universityWallet: record.universityWallet,
            issueDate: record.issueDate,
            status: record.status
        };

        return JSON.stringify(verification);
    }

    @Transaction(false)
    public async GetAllCredentialHashes(ctx: Context): Promise<string> {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
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
    }
}