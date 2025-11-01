const IDB_NAME = 'mgnrega-cache';
const IDB_STORE = 'districts';
function openDb(){
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbPut(key, data){
  const db = await openDb();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(IDB_STORE,'readwrite');
    tx.objectStore(IDB_STORE).put({ key, data, ts: Date.now() });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}
async function idbGet(key){
  const db = await openDb();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(IDB_STORE,'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = () => resolve(req.result && req.result.data);
    req.onerror = () => reject(req.error);
  });
}
async function idbKeys(){ const db = await openDb(); return new Promise((res,rej)=>{ const tx=db.transaction(IDB_STORE,'readonly'); const os=tx.objectStore(IDB_STORE); const r=os.getAllKeys(); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }); }

window.IDB = { idbPut, idbGet, idbKeys };
