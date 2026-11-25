export function ticketReference(ticketId:string){return "AXY-"+ticketId.toUpperCase();}
export function ticketIdFromReference(reference:string){return /^AXY-[A-Z0-9]+$/.test(reference)?reference.slice(4).toLowerCase():null;}
