export const ranks=['พลทหาร','สิบตรี','สิบโท','สิบเอก','จ่าสิบตรี','จ่าสิบโท','จ่าสิบเอก','ร้อยตรี','ร้อยโท','ร้อยเอก','พันตรี','พันโท','พันเอก','พลตรี','พลโท','พลเอก'];
export const branches=['ทหารราบ','ทหารม้า','ทหารปืนใหญ่','ทหารช่าง','ทหารสื่อสาร'];
export const badges=[{name:'นักแม่นปืน',skill:'combat',min:60},{name:'พลร่ม',skill:'fitness',min:60},{name:'ผู้นำหน่วย',skill:'leadership',min:60},{name:'จู่โจม',skill:'combat',min:85},{name:'นักเดินทางไกล',skill:'fitness',min:85},{name:'ครูฝึก',skill:'leadership',min:85},{name:'ช่วยเหลือประชาชน',skill:'missions',min:5},{name:'ปฏิบัติหน้าที่ดีเด่น',skill:'missions',min:15},{name:'ผู้บังคับบัญชาดีเด่น',skill:'ordersCompleted',min:20}];
export function fresh(){return {name:'ทหารใหม่',branch:branches[0],week:1,xp:0,rank:0,energy:100,morale:75,fitness:15,combat:10,leadership:5,missions:0,ordersCompleted:0,assignments:{},badges:[],log:['ยินดีต้อนรับเข้าสู่กรมทหาร เริ่มเส้นทางของคุณด้วยการฝึกพื้นฐาน']};}
export function act(s,type){const n=structuredClone(s);let message='';const cost=type==='mission'?30:20;
if(type==='rest'){n.energy=Math.min(100,n.energy+45);n.morale=Math.min(100,n.morale+10);message='พักประจำสัปดาห์ ฟื้นฟูกำลังและขวัญกำลังใจ';}
else if(['fitness','combat','leadership','mission'].includes(type)){
if(n.energy<cost)return {state:s,error:'กำลังพลอ่อนล้า กรุณาพักฟื้นก่อน'};
if(type==='mission'&&(n.fitness<30||n.combat<30))return {state:s,error:'ภารกิจต้องใช้สมรรถภาพและทักษะการรบอย่างละ 30 ขึ้นไป'};
n.energy-=cost;n.xp+=type==='mission'?60:25;
if(type==='mission'){n.missions++;n.leadership=Math.min(100,n.leadership+8);message='สำเร็จภารกิจช่วยเหลือประชาชน ได้รับประสบการณ์ 60';}else{n[type]=Math.min(100,n[type]+15);message=`ฝึก${{fitness:'สมรรถภาพ',combat:'ยุทธวิธี',leadership:'ภาวะผู้นำ'}[type]}สำเร็จ ได้รับประสบการณ์ 25`;}
}else return {state:s,error:'ไม่พบกิจกรรม'};
n.week++;n.log.unshift(message);return {state:n};}
export function promote(s){const required=(s.rank+1)*100;if(s.rank>=ranks.length-1)return {state:s,error:'คุณถึงยศสูงสุดของต้นแบบแล้ว'};if(s.xp<required)return {state:s,error:`ต้องมีประสบการณ์สะสม ${required} เพื่อเลื่อนยศ`};const n=structuredClone(s);n.rank++;n.log.unshift(`ได้รับการเลื่อนยศเป็น ${ranks[n.rank]}`);return {state:n};}
export function claim(s,name){const b=badges.find(x=>x.name===name);if(!b||(s[b.skill]||0)<b.min||s.badges.includes(name))return {state:s,error:'ยังไม่ผ่านเกณฑ์ หรือได้รับเครื่องหมายนี้แล้ว'};const n=structuredClone(s);n.badges.push(name);n.log.unshift(`ผ่านการทดสอบและได้รับเครื่องหมาย${name}`);return {state:n};}
export const orders=[
{name:'ฝึกประจำวัน',minRank:1,leadership:5,xp:10},
{name:'จัดเวรยาม',minRank:1,leadership:5,xp:10},
{name:'เตรียมอุปกรณ์',minRank:1,leadership:5,xp:10},
{name:'ฝึกระเบียบแถว',minRank:2,leadership:7,xp:15},
{name:'ตรวจความพร้อมหน่วย',minRank:4,leadership:8,xp:20},
{name:'ประสานงานช่วยภัยพิบัติ',minRank:7,leadership:10,xp:25},
{name:'วางแผนการฝึกร่วม',minRank:10,leadership:12,xp:30}
];
const names=['ธนา','กิตติ','นที','ภาคิน','ศรัณย์','วรินทร์','อาทิตย์','ชยพล','ธีรภัทร','ปกรณ์','วีรพล','ภาณุ','สุรศักดิ์','อนันต์','วิชัย','ประเสริฐ'];
export const personnel=ranks.map((rank,i)=>({id:`soldier-${i}`,name:names[i],rank:i,branch:branches[i%branches.length],badges:i>=7?['ผู้นำหน่วย','ครูฝึก']:i>=3?['นักแม่นปืน']:[]}));
export function roster(s){return [{id:'player',name:s.name,rank:s.rank,branch:s.branch,badges:s.badges,player:true},...personnel].sort((a,b)=>b.rank-a.rank||a.name.localeCompare(b.name,'th'));}
export function command(s,target,order){
const soldier=typeof target==='string'?personnel.find(p=>p.id===target):personnel.find(p=>p.rank===target);
if(!soldier||soldier.rank>=s.rank)return {state:s,error:'สั่งการได้เฉพาะทหารที่มียศต่ำกว่าคุณ'};
const task=orders.find(o=>o.name===order);
if(!task)return {state:s,error:'ไม่พบคำสั่ง'};
if(s.rank<task.minRank)return {state:s,error:`คำสั่งนี้ต้องมียศ ${ranks[task.minRank]} ขึ้นไป`};
if(s.energy<10)return {state:s,error:'กรุณาพักก่อนสั่งการ'};
const n=structuredClone(s);n.energy-=10;n.leadership=Math.min(100,n.leadership+task.leadership);n.xp+=task.xp;n.week++;
n.ordersCompleted=(n.ordersCompleted||0)+1;n.assignments={...n.assignments,[soldier.id]:{order,week:n.week,status:'สำเร็จ'}};
n.log.unshift(`สั่ง ${ranks[soldier.rank]} ${soldier.name} ให้${order} — ปฏิบัติงานเรียบร้อย`);return {state:n};}
