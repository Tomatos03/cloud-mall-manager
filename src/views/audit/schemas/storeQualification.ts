import { z } from 'zod'

export const StoreQualificationAuditSchema = z.object({
    subjectType: z.string(),
    realName: z.string().optional(),
    idCard: z.string().optional(),
    idCardValidStart: z.string().optional(),
    idCardValidEnd: z.string().optional(),
    idCardFront: z.string().optional(),
    idCardBack: z.string().optional(),
    licenseNumber: z.string().optional(),
    licenseName: z.string().optional(),
    establishmentDate: z.string().optional(),
    registeredAddress: z.string().optional(),
    licensePhoto: z.string().optional(),
    storeName: z.string().optional(),
    categories: z.array(z.union([z.string(), z.number()])).optional(),
    shippingAddress: z.string().optional(),
    bankAccountName: z.string().optional(),
    bankCardNumber: z.string().optional(),
    bankName: z.string().optional(),
    bankBranchName: z.string().optional(),
    bankMobile: z.string().optional(),
})

export type StoreQualificationAudit = z.infer<typeof StoreQualificationAuditSchema>
