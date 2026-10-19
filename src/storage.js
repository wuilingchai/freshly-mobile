import { Capacitor } from '@capacitor/core';
import { SQLiteConnection, CapacitorSQLite } from '@capacitor-community/sqlite';
// Native installs: on-device SQLite. Browser preview: localStorage, offline.
const KEY='freshly.items.v1';
let connection;
let writeQueue=Promise.resolve();
async function db(){
  if(connection) return connection;
  const manager=new SQLiteConnection(CapacitorSQLite);
  const conn=await manager.createConnection('freshly_inventory',false,'no-encryption',1,false);
  await conn.open();
  await conn.execute(`CREATE TABLE IF NOT EXISTS inventory (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL, expiry TEXT NOT NULL, quantity TEXT, notes TEXT, added TEXT NOT NULL);`);
  connection=conn;
  return conn;
}
function valid(x){return x&&typeof x.id==='string'&&typeof x.name==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.expiry||'')}
export const store={
  async load(){
    if(!Capacitor.isNativePlatform()){
      try {return (JSON.parse(localStorage.getItem(KEY)||'[]')||[]).filter(valid)}catch{return []}
    }
    const c=await db();
    const result=await c.query('SELECT id,name,category,expiry,quantity,notes,added FROM inventory ORDER BY added DESC;');
    return (result.values||[]).filter(valid);
  },
  replaceAll(data){
    const snapshot=data.map(x=>({...x}));
    writeQueue=writeQueue.catch(()=>{}).then(async()=>{
      if(!Capacitor.isNativePlatform()){
        localStorage.setItem(KEY,JSON.stringify(snapshot));return;
      }
      const c=await db();
      // A transaction makes the full replacement atomic in native SQLite.
      await c.execute('BEGIN TRANSACTION;');
      try{
        await c.run('DELETE FROM inventory;');
        for(const x of snapshot){
          await c.run('INSERT INTO inventory (id,name,category,expiry,quantity,notes,added) VALUES (?,?,?,?,?,?,?);',[x.id,x.name,x.category,x.expiry,x.quantity||'',x.notes||'',x.added||new Date().toISOString()]);
        }
        await c.execute('COMMIT;');
      }catch(e){await c.execute('ROLLBACK;');throw e}
    });
    return writeQueue;
  }
};
