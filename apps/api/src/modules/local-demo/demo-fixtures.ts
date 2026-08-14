import type { PasswordHasher } from "../iam/application";
import type { LocalAuthIdentityRecord } from "../iam/application";
import type { TenantDirectoryPort, TenantDto, UnitDto } from "../iam/api";
import { Roles, type Role } from "../iam/domain";

export const DemoLocalCredentials = {
  password: "demo-password",
} as const;

export const DemoIds = {
  auditorUser: "66666666-6666-4666-8666-666666666666",
  cashierUser: "77777777-7777-4777-8777-777777777777",
  company: "99999999-9999-4999-8999-999999999999",
  membershipAuditor: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  membershipCashier: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  membershipOwner: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  membershipUnitManager: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  membershipWaiter: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  ownerUser: "ffffffff-ffff-4fff-8fff-ffffffffffff",
  roleAuditor: "12121212-1212-4212-8212-121212121212",
  roleCashier: "13131313-1313-4313-8313-131313131313",
  roleOwner: "14141414-1414-4414-8414-141414141414",
  roleUnitManager: "15151515-1515-4515-8515-151515151515",
  roleWaiter: "16161616-1616-4616-8616-161616161616",
  tenant: "22222222-2222-4222-8222-222222222222",
  unit: "33333333-3333-4333-8333-333333333333",
  unitManagerUser: "17171717-1717-4717-8717-171717171717",
  waiterUser: "11111111-1111-4111-8111-111111111111",
} as const;

export const DemoTenant: TenantDto = {
  id: DemoIds.tenant,
  name: "Mr Coti Demo",
  status: "ACTIVE",
};

export const DemoUnit: UnitDto = {
  id: DemoIds.unit,
  name: "Unidade Demo",
  status: "ACTIVE",
};

export interface DemoUserDefinition {
  readonly displayName: string;
  readonly id: string;
  readonly membershipId: string;
  readonly role: Role;
  readonly roleAssignmentId: string;
  readonly syntheticEmail: string;
  readonly unitId: string | null;
}

export const DemoUsers = [
  {
    displayName: "Owner Demo",
    id: DemoIds.ownerUser,
    membershipId: DemoIds.membershipOwner,
    role: Roles.TenantOwner,
    roleAssignmentId: DemoIds.roleOwner,
    syntheticEmail: "owner.demo@mrcoti.local",
    unitId: null,
  },
  {
    displayName: "Manager Demo",
    id: DemoIds.unitManagerUser,
    membershipId: DemoIds.membershipUnitManager,
    role: Roles.UnitManager,
    roleAssignmentId: DemoIds.roleUnitManager,
    syntheticEmail: "manager.demo@mrcoti.local",
    unitId: DemoIds.unit,
  },
  {
    displayName: "Waiter Demo",
    id: DemoIds.waiterUser,
    membershipId: DemoIds.membershipWaiter,
    role: Roles.Waiter,
    roleAssignmentId: DemoIds.roleWaiter,
    syntheticEmail: "waiter.demo@mrcoti.local",
    unitId: DemoIds.unit,
  },
  {
    displayName: "Cashier Demo",
    id: DemoIds.cashierUser,
    membershipId: DemoIds.membershipCashier,
    role: Roles.Cashier,
    roleAssignmentId: DemoIds.roleCashier,
    syntheticEmail: "cashier.demo@mrcoti.local",
    unitId: DemoIds.unit,
  },
  {
    displayName: "Auditor Demo",
    id: DemoIds.auditorUser,
    membershipId: DemoIds.membershipAuditor,
    role: Roles.Auditor,
    roleAssignmentId: DemoIds.roleAuditor,
    syntheticEmail: "auditor.demo@mrcoti.local",
    unitId: DemoIds.unit,
  },
] as const satisfies readonly DemoUserDefinition[];

export async function createDemoIdentityRecords(
  passwordHasher: PasswordHasher,
): Promise<LocalAuthIdentityRecord[]> {
  const passwordHash = await passwordHasher.hash(DemoLocalCredentials.password);

  return DemoUsers.map((user) => ({
    displayName: user.displayName,
    id: user.id,
    memberships: [
      {
        id: user.membershipId,
        roleAssignments: [
          {
            id: user.roleAssignmentId,
            role: user.role,
            tenantId: DemoIds.tenant,
            unitId: user.unitId,
          },
        ],
        status: "ACTIVE",
        tenantId: DemoIds.tenant,
      },
    ],
    passwordHash,
    status: "ACTIVE",
    syntheticEmail: user.syntheticEmail,
  }));
}

export class DemoTenantDirectory implements TenantDirectoryPort {
  async findTenant(tenantId: string): Promise<TenantDto | null> {
    if (tenantId !== DemoIds.tenant) {
      return null;
    }

    return DemoTenant;
  }

  async listUnits(tenantId: string, unitIds: readonly string[]): Promise<readonly UnitDto[]> {
    if (tenantId !== DemoIds.tenant) {
      return [];
    }

    if (unitIds.length === 0 || unitIds.includes(DemoIds.unit)) {
      return [DemoUnit];
    }

    return [];
  }
}
