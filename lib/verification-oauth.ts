import crypto from "crypto";

const secret=()=>process.env.AUTH_SECRET||process.env.NEXTAUTH_SECRET||process.env.ENCRYPTION_MASTER_KEY||"";
export function signVerificationState(payload:{guildId:string;nonce:string;exp:number;mode:"CAPTCHA"|"OAUTH"}){
  const raw=Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig=crypto.createHmac("sha256",secret()).update(raw).digest("base64url");
  return `${raw}.${sig}`;
}
export function verifyVerificationState(state:string){
  const [raw,sig]=state.split(".");
  if(!raw||!sig||!secret())return null;
  const expected=crypto.createHmac("sha256",secret()).update(raw).digest("base64url");
  if(sig.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null;
  try{
    const value=JSON.parse(Buffer.from(raw,"base64url").toString("utf8"));
    if(!value.guildId||!value.exp||Date.now()>value.exp||!["CAPTCHA","OAUTH"].includes(value.mode))return null;
    return value as {guildId:string;nonce:string;exp:number;mode:"CAPTCHA"|"OAUTH"};
  }catch{return null}
}
export const verificationRedirectUri=()=>`${process.env.AXYON_PUBLIC_URL||"https://www.axyon.es"}/api/verify/discord/callback`;
export function captchaAnswerHash(token:string,answer:string){
  return crypto.createHash("sha256").update(`${token}:${answer}:${secret()}`).digest("hex");
}
