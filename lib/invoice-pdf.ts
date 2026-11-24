type InvoiceDocument={number:string;date:string;paidDate:string;issuer:string[];customer:string[];concept:string;currency:string;base:number;tax:number;total:number;method:string};
function literal(value:string){
 const chars=Array.from(value.normalize("NFC").replace(/[\r\n\t]/g," "));
 return "("+chars.map(c=>{let n=c.charCodeAt(0);if(c==="€")n=128;if(n>255||n<32)n=63;return "\\"+n.toString(8).padStart(3,"0")}).join("")+")";
}
export function invoicePdf(d:InvoiceDocument):Buffer{
 const commands:string[]=[];
 function text(x:number,y:number,value:string,size=11,bold=false,color="0.13 0.18 0.27"){
  commands.push("BT /"+(bold?"F2":"F1")+" "+size+" Tf "+color+" rg 1 0 0 1 "+x+" "+y+" Tm "+literal(value)+" Tj ET");
 }
 function lines(x:number,y:number,values:string[],width=38){
  for(const value of values){const chunks=value.match(new RegExp(".{1,"+width+"}","gu"))||[""];for(const chunk of chunks){text(x,y,chunk,10);y-=15;}}
  return y;
 }
 function rect(x:number,y:number,w:number,h:number,color:string){commands.push(color+" rg "+x+" "+y+" "+w+" "+h+" re f")}
 const money=(n:number)=>new Intl.NumberFormat("es-ES",{style:"currency",currency:d.currency}).format(n/100).replace(/\u00a0/g," ");
 rect(0,730,595,112,"0.035 0.067 0.125");
 text(42,790,"AXYON",29,true,"1 1 1");text(42,766,"FACTURACION",10,true,"0.62 0.75 1");
 text(355,790,"FACTURA",22,true,"1 1 1");text(355,766,d.number,12,false,"1 1 1");
 text(42,697,"Fecha de emisión: "+d.date);text(42,677,"Fecha de pago: "+d.paidDate);
 text(42,640,"EMISOR",11,true);text(310,640,"CLIENTE",11,true);
 const y=Math.min(lines(42,620,d.issuer),lines(310,620,d.customer))-30;
 rect(42,y-24,511,26,"0.10 0.19 0.34");text(52,y-15,"CONCEPTO",10,true,"1 1 1");text(430,y-15,"IMPORTE",10,true,"1 1 1");
 const row=lines(52,y-47,[d.concept],49);text(430,y-47,money(d.base));
 const totals=row-28;text(310,totals,"Base imponible");text(430,totals,money(d.base));text(310,totals-23,"Impuestos");text(430,totals-23,money(d.tax));
 rect(300,totals-64,253,30,"0.90 0.94 1");text(310,totals-53,"TOTAL",12,true);text(430,totals-53,money(d.total),12,true);
 text(42,totals-97,"Estado: PAGADA",12,true,"0.05 0.40 0.23");text(42,totals-117,"Método de pago: "+d.method);
 text(42,45,"axyon.es  |  Documento generado por Axyon",9);
 const stream=commands.join("\n");
 const objects=["<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>","<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>","<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>","<< /Length "+Buffer.byteLength(stream,"ascii")+" >>\nstream\n"+stream+"\nendstream"];
 let out="%PDF-1.4\n";const offsets=[0];
 for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(out,"ascii"));out+=(i+1)+" 0 obj\n"+objects[i]+"\nendobj\n";}
 const xref=Buffer.byteLength(out,"ascii");out+="xref\n0 "+offsets.length+"\n0000000000 65535 f \n"+offsets.slice(1).map(n=>String(n).padStart(10,"0")+" 00000 n \n").join("")+"trailer\n<< /Size "+offsets.length+" /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF\n";
 return Buffer.from(out,"ascii");
}
