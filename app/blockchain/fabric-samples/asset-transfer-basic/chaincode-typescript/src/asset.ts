/*
  SPDX-License-Identifier: Apache-2.0
*/

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Asset {
    @Property()
    public docType?: string;

    @Property()
    public ID: string = '';

    @Property()
    public Owner: string = '';

    @Property()
    public department: string = '';

    @Property()
    public academicYear: string = '';

    @Property()
    public joinDate: string = '';

    @Property()
    public endDate: string = '';

    @Property()
    public certificateType: string = '';

    @Property()
    public issueDate: string = '';

    @Property()
    public status: string = '';

    @Property()
    public txHash: string = '';

    // New fields for RBAC tracking
    @Property()
    public createdBy?: string;

    @Property()
    public createdAt?: string;

    @Property()
    public updatedBy?: string;

    @Property()
    public updatedAt?: string;
}