import {z} from "zod";
import {prisma} from "@/lib/prisma";
export const issuerKey="billing:invoice-issuer";
export const issuerSchema=z.object({name:z.string().trim().min(1).max(100),taxId:z.string().trim().min(1).max(40),address:z.string().trim().min(1).max(140)}).strict();
export async function readInvoiceIssuer(){
 const row=await prisma.setting.findUnique({where:{key:issuerKey}});
 if(row)return issuerSchema.safeParse(JSON.parse(row.value));
 return issuerSchema.safeParse({name:process.env.INVOICE_ISSUER_NAME,taxId:process.env.INVOICE_ISSUER_TAX_ID,address:process.env.INVOICE_ISSUER_ADDRESS});
}
