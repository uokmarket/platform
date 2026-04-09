/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║          KabiangaMarket — React Native Mobile App               ║
 * ║          University of Kabianga Second-Hand Marketplace          ║
 * ║                                                                  ║
 * ║  TO RUN:                                                         ║
 * ║    1. npm install                                                ║
 * ║    2. npx expo start                                             ║
 * ║    3. Scan QR with Expo Go app on your phone                     ║
 * ║                                                                  ║
 * ║  TO BUILD FOR PLAY STORE:                                        ║
 * ║    1. npx eas build --platform android --profile production      ║
 * ║    2. Download the .aab from Expo dashboard                      ║
 * ║    3. Upload to Google Play Console                              ║
 * ║                                                                  ║
 * ║  BACKEND URL: Change API_BASE below to your server URL           ║
 * ║  Admin: admin@kabianga.ac.ke / Admin@2025!                       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * FILE: App.js  (place this in your Expo project root)
 *
 * REQUIRED package.json dependencies:
 * {
 *   "expo": "~51.0.0",
 *   "react": "18.2.0",
 *   "react-native": "0.74.5",
 *   "@react-navigation/native": "^6.1.18",
 *   "@react-navigation/stack": "^6.4.1",
 *   "@react-navigation/bottom-tabs": "^6.6.1",
 *   "react-native-safe-area-context": "4.10.5",
 *   "react-native-screens": "3.31.1",
 *   "react-native-gesture-handler": "~2.16.1",
 *   "@react-native-async-storage/async-storage": "^1.24.0",
 *   "@expo/vector-icons": "^14.0.3",
 *   "expo-image-picker": "~15.0.7",
 *   "expo-linear-gradient": "~13.0.2",
 *   "expo-status-bar": "~1.12.1"
 * }
 */

import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  FlatList, Image, ActivityIndicator, Alert, Modal, RefreshControl,
  Dimensions, StatusBar, Platform, KeyboardAvoidingView, Linking,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

const { width: W, height: H } = Dimensions.get('window');
const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

/* ═══════════════════════════════════════════════════════════════
   CONFIGURATION — change API_BASE to your deployed server URL
═══════════════════════════════════════════════════════════════ */
const API_BASE    = 'https://api.kabiangamarket.ac.ke/api'; // ← YOUR SERVER URL
const ADMIN_EMAIL = 'admin@kabianga.ac.ke';
const ADMIN_PASS  = 'Admin@2025!';
const ADMIN_NAME  = 'KabiangaMarket Admin';
const WHATSAPP_NUM = '+254753558196';
const CALL_NUM     = '+254753558196';

/* ═══════════════════════════════════════════════════════════════
   THEME / DESIGN TOKENS
═══════════════════════════════════════════════════════════════ */
const C = {
  g1:'#0c1f13', g2:'#163524', g3:'#1e4d33', g4:'#2d6a47', g5:'#3d8b5e',
  gold:'#d4930a', gold2:'#f0b429', gold3:'#fdd87a',
  red:'#dc2626', green:'#16a34a', blue:'#2563eb', purple:'#7c3aed',
  bg:'#f5f1ea', bg2:'#ede8df', surf:'#ffffff', card:'#ffffff',
  bdr:'#ddd6c8', inp:'#f0ece4',
  t1:'#0d1b0f', t2:'#3a5040', t3:'#7a9485', t4:'#a8bfb0',
  nav:'#080f09',
  gGold:['#d4930a','#f0b429'],
  gGreen:['#0c1f13','#163524'],
  gGreenM:['#1e4d33','#2d6a47'],
  sh:{ shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:8, elevation:3 },
  shMd:{ shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.13, shadowRadius:14, elevation:6 },
};
const F = { r:'System', b:'System', xb:'System' };
const SZ = { xs:10, sm:12, base:14, md:16, lg:18, xl:20, '2xl':24, '3xl':30 };
const CAT_BG = {
  electronics:['#dbeafe','#bfdbfe'], books:['#fef9c3','#fde68a'],
  clothing:['#fce7f3','#fbcfe8'], furniture:['#d1fae5','#a7f3d0'],
  household:['#ede9fe','#ddd6fe'], sports:['#ffedd5','#fed7aa'],
  food:['#fef3c7','#fde68a'], other:['#f0f4ff','#c7d2fe'],
};
const CAT_EMOJI = {electronics:'📱',books:'📚',clothing:'👗',furniture:'🛋️',household:'🏠',sports:'⚽',food:'🍱',other:'🎒'};
const CATS = [
  {slug:'all',name:'All',emoji:'🛍️'},{slug:'electronics',name:'Electronics',emoji:'📱'},
  {slug:'books',name:'Books',emoji:'📚'},{slug:'clothing',name:'Clothing',emoji:'👗'},
  {slug:'furniture',name:'Furniture',emoji:'🛋️'},{slug:'household',name:'Household',emoji:'🏠'},
  {slug:'sports',name:'Sports',emoji:'⚽'},{slug:'other',name:'Other',emoji:'🎒'},
];
const SAMPLE_ITEMS = [
  {id:1,name:'Samsung Galaxy A12',price:8500,location:'UoK Hostel A',phone:'0712 345 678',cat:'electronics',emoji:'📱',description:'64GB, charger included. Works perfectly.',condition:'good',status:'approved',seller_name:'James Mwangi',created_at:'2025-01-10',image_url:null},
  {id:2,name:'Introduction to Programming',price:350,location:'UoK Library',phone:'0723 456 789',cat:'books',emoji:'📚',description:'2nd year CS textbook. Great condition.',condition:'good',status:'approved',seller_name:'Amina Wanjiku',created_at:'2025-01-12',image_url:null},
  {id:3,name:'Ladies Denim Jacket',price:600,location:'Village Market',phone:'0734 567 890',cat:'clothing',emoji:'👗',description:'Size M. Worn 3 times. Excellent condition.',condition:'new',status:'approved',seller_name:'Grace Achieng',created_at:'2025-01-14',image_url:null},
  {id:4,name:'Study Table & Chair',price:1800,location:'UoK Off-Campus',phone:'0745 678 901',cat:'furniture',emoji:'🛋️',description:'Sturdy wooden table with matching chair.',condition:'good',status:'approved',seller_name:'Kevin Omondi',created_at:'2025-01-15',image_url:null},
  {id:5,name:'Infinix Hot 11 – 128GB',price:7200,location:'Kabianga Town',phone:'0756 789 012',cat:'electronics',emoji:'📱',description:'4GB RAM, great battery.',condition:'new',status:'approved',seller_name:'Mary Njoki',created_at:'2025-01-16',image_url:null},
  {id:6,name:'Business Management Text',price:400,location:'UoK Hostel B',phone:'0767 890 123',cat:'books',emoji:'📖',description:'4th edition. Very clean.',condition:'good',status:'approved',seller_name:'Peter Kamau',created_at:'2025-01-17',image_url:null},
  {id:7,name:"Men's Running Shoes",price:900,location:'UoK Sports Complex',phone:'0778 901 234',cat:'clothing',emoji:'👟',description:'Nike Air Max. Used twice.',condition:'good',status:'approved',seller_name:'David Otieno',created_at:'2025-01-18',image_url:null},
  {id:8,name:'Electric Kettle 1.7L',price:750,location:'Village Near UoK Gate',phone:'0789 012 345',cat:'household',emoji:'☕',description:'Works perfectly.',condition:'new',status:'approved',seller_name:'Susan Chebet',created_at:'2025-01-19',image_url:null},
  {id:9,name:'HP 250 G8 Laptop',price:28000,location:'UoK ICT Block',phone:'0790 123 456',cat:'electronics',emoji:'💻',description:'Core i5, 8GB RAM, 256GB SSD.',condition:'good',status:'pending',seller_name:'John Kipchoge',created_at:'2025-01-20',image_url:null},
  {id:10,name:'Single Foam Mattress',price:2200,location:'UoK Off-Campus Rooms',phone:'0701 234 567',cat:'furniture',emoji:'🛏️',description:'4-inch foam. Clean.',condition:'good',status:'approved',seller_name:'Faith Wangui',created_at:'2025-01-21',image_url:null},
];
const AUTO_REPLIES = ['Hi! Yes, still available 😊','Condition is very good!','Can meet at UoK main gate?','Price negotiable — what is your offer?','Payment on delivery is fine 👍','Call me on the number listed! 📞'];

/* ═══════════════════════════════════════════════════════════════
   STORAGE KEYS
═══════════════════════════════════════════════════════════════ */
const K = { token:'@kbm_token', user:'@kbm_user', cart:'@kbm_cart', users:'@kbm_users', items:'@kbm_items', receipts:'@kbm_receipts' };

/* ═══════════════════════════════════════════════════════════════
   API SERVICE — connects to Django backend, falls back offline
═══════════════════════════════════════════════════════════════ */
let _token = null;
async function getToken(){ if(!_token) _token = await AsyncStorage.getItem(K.token); return _token; }
async function setToken(t){ _token=t; if(t) await AsyncStorage.setItem(K.token,t); else await AsyncStorage.removeItem(K.token); }
async function storeUser(u){ await AsyncStorage.setItem(K.user, JSON.stringify(u)); }

async function apiFetch(method, endpoint, body=null, isForm=false){
  const token = await getToken();
  const headers = {};
  if(!isForm) headers['Content-Type']='application/json';
  if(token) headers['Authorization']=`Token ${token}`;
  const cfg = { method, headers };
  if(body) cfg.body = isForm ? body : JSON.stringify(body);
  const ctrl = new AbortController();
  const tid  = setTimeout(()=>ctrl.abort(), 12000);
  cfg.signal = ctrl.signal;
  try {
    const res  = await fetch(`${API_BASE}${endpoint}`, cfg);
    clearTimeout(tid);
    const data = await res.json().catch(()=>({}));
    if(!res.ok){ const m=data?.error||data?.message||data?.detail||`Error ${res.status}`; throw new Error(m); }
    return data;
  } catch(err){
    clearTimeout(tid);
    if(err.name==='AbortError') return {offline:true};
    if(err.message?.includes('fetch')) return {offline:true};
    throw err;
  }
}
const API = {
  get:  (ep)      => apiFetch('GET',ep),
  post: (ep,body) => apiFetch('POST',ep,body),
  patch:(ep,body) => apiFetch('PATCH',ep,body),
  form: (ep,form) => apiFetch('POST',ep,form,true),
  login:    async(email,pw)     => { const r=await API.post('/auth/login/',{email,password:pw}); if(r?.data?.token){await setToken(r.data.token);await storeUser(r.data.user||{email,name:email.split('@')[0]});} return r; },
  register: async(name,email,phone,pw) => API.post('/auth/register/',{name,email,phone,password:pw,confirm_password:pw}),
  social:   async(p,email,name) => { const r=await API.post('/auth/social/',{provider:p,email,name}); if(r?.data?.token){await setToken(r.data.token);await storeUser(r.data.user||{email,name});} return r; },
  logout:   async()=>{try{await API.post('/auth/logout/',{});}catch(_){}; await setToken(null); await AsyncStorage.removeItem(K.user);},
  me:       ()=>API.get('/auth/me/'),
  items:    (cat,q)=>API.get(`/items/?${cat?`category=${cat}&`:''}${q?`search=${encodeURIComponent(q)}`:''}`.replace(/\?$/,'')),
  postItem: async(d)=>{ const f=new FormData(); Object.entries(d).forEach(([k,v])=>{ if(k==='image'&&v){f.append('image',{uri:v,name:'item.jpg',type:'image/jpeg'});}else if(k!=='image')f.append(k,String(v)); }); return API.form('/items/create/',f); },
  myItems:  ()=>API.get('/items/mine/'),
  cats:     ()=>API.get('/categories/'),
  receipt:  (items,total)=>API.post('/receipts/create/',{items,total}),
  myRcts:   ()=>API.get('/receipts/'),
  contact:  (name,email,msg)=>API.post('/contact/',{name,email,message:msg}),
  settings: ()=>API.get('/settings/'),
  adDash:   ()=>API.get('/admin/dashboard/'),
  adItems:  (s,q)=>API.get(`/admin/items/?status=${s}${q?`&search=${encodeURIComponent(q)}`:''}`),
  adIAct:   (id,action,reason)=>API.post(`/admin/items/${id}/action/`,{action,reason}),
  adUsers:  (s,q)=>API.get(`/admin/users/?status=${s}${q?`&search=${encodeURIComponent(q)}`:''}`),
  adUAct:   (id,action,reason)=>API.post(`/admin/users/${id}/action/`,{action,reason}),
  adRcts:   ()=>API.get('/admin/receipts/'),
  adMsgs:   ()=>API.get('/admin/messages/'),
  adSave:   (settings)=>API.post('/admin/settings/',{settings}),
  adLogs:   ()=>API.get('/admin/logs/'),
};

/* ═══════════════════════════════════════════════════════════════
   APP STATE (React Context)
═══════════════════════════════════════════════════════════════ */
const AppCtx = createContext({});
function useApp(){ return useContext(AppCtx); }

function AppProvider({ children }){
  const [user,setUser]         = useState(null);
  const [isAdmin,setIsAdmin]   = useState(false);
  const [cart,setCart]         = useState([]);
  const [toast,setToast]       = useState(null);
  const [localUsers,setLocalUsers] = useState([]);
  const [localItems,setLocalItems] = useState(SAMPLE_ITEMS);
  const [localReceipts,setLocalReceipts] = useState([]);
  const toastTimer = useRef(null);

  useEffect(()=>{ boot(); },[]);

  async function boot(){
    const [storedUser,storedCart,storedUsers,storedItems,storedReceipts] = await Promise.all([
      AsyncStorage.getItem(K.user), AsyncStorage.getItem(K.cart),
      AsyncStorage.getItem(K.users), AsyncStorage.getItem(K.items),
      AsyncStorage.getItem(K.receipts),
    ]);
    if(storedCart) setCart(JSON.parse(storedCart));
    if(storedUsers) setLocalUsers(JSON.parse(storedUsers));
    if(storedItems) setLocalItems(JSON.parse(storedItems));
    if(storedReceipts) setLocalReceipts(JSON.parse(storedReceipts));
    if(storedUser){
      const u=JSON.parse(storedUser);
      setUser(u); setIsAdmin(!!(u.is_admin||u.isAdmin));
      // verify token
      const me = await API.me().catch(()=>null);
      if(me?.data){ setUser(me.data); setIsAdmin(!!me.data.is_admin); await storeUser(me.data); }
      else if(me?.offline){ /* keep local session */ }
      else { await logout(); }
    }
  }

  function showToast(msg,type='info'){
    if(toastTimer.current) clearTimeout(toastTimer.current);
    setToast({msg,type});
    toastTimer.current = setTimeout(()=>setToast(null),3000);
  }

  async function login(email,pw){
    if(email.toLowerCase()===ADMIN_EMAIL&&pw===ADMIN_PASS){
      const au={name:ADMIN_NAME,email:ADMIN_EMAIL,is_admin:true,status:'approved'};
      setUser(au); setIsAdmin(true); await storeUser(au);
      showToast('Admin login successful 🛡️','success'); return {success:true,isAdmin:true};
    }
    try{
      const r=await API.login(email,pw);
      if(r?.offline){
        // offline: check local users
        const found=localUsers.find(u=>u.email.toLowerCase()===email.toLowerCase());
        if(!found) return {success:false,error:'No account found. Please register.'};
        if(found.pw!==btoa(pw)) return {success:false,error:'Incorrect password.'};
        if(found.status==='pending') return {success:false,error:'Account pending admin approval.',pending:true};
        if(found.status!=='approved') return {success:false,error:'Account not active.'};
        setUser(found); setIsAdmin(false); await storeUser(found);
        showToast('Logged in (offline mode)','success'); return {success:true};
      }
      if(!r?.success) return {success:false,error:r?.error||'Login failed'};
      const u=r.data?.user||{email,name:email.split('@')[0]};
      setUser(u); setIsAdmin(!!r.data?.is_admin); await storeUser(u);
      showToast(`Welcome back, ${u.name}! 👋`,'success'); return {success:true,isAdmin:!!r.data?.is_admin};
    }catch(err){ return {success:false,error:err.message}; }
  }

  async function register(name,email,phone,pw){
    try{
      const r=await API.register(name,email,phone,pw);
      if(r?.offline){
        if(localUsers.find(u=>u.email.toLowerCase()===email.toLowerCase())) return {success:false,error:'Email already registered.'};
        const nu={id:Date.now(),name,email,phone,pw:btoa(pw),status:'pending',registeredAt:new Date().toLocaleDateString(),socialProvider:'email'};
        const updated=[...localUsers,nu]; setLocalUsers(updated);
        await AsyncStorage.setItem(K.users,JSON.stringify(updated));
        return {success:true,pending:true};
      }
      if(!r?.success) return {success:false,error:r?.error||'Registration failed'};
      return {success:true,pending:true};
    }catch(err){ return {success:false,error:err.message}; }
  }

  async function socialLogin(provider,email,name){
    try{
      const r=await API.social(provider,email,name);
      if(r?.offline){
        let found=localUsers.find(u=>u.email.toLowerCase()===email.toLowerCase());
        if(found){
          if(found.status==='pending') return {success:true,pending:true};
          if(found.status==='approved'){ setUser(found); await storeUser(found); showToast(`Signed in via ${provider} ✓`,'success'); return {success:true}; }
          return {success:false,error:'Account not active.'};
        }
        const nu={id:Date.now(),name,email,pw:btoa('social_'+Date.now()),status:'pending',registeredAt:new Date().toLocaleDateString(),socialProvider:provider};
        const updated=[...localUsers,nu]; setLocalUsers(updated);
        await AsyncStorage.setItem(K.users,JSON.stringify(updated));
        return {success:true,pending:true};
      }
      if(r?.data?.token){ const u=r.data.user||{email,name}; setUser(u); await storeUser(u); showToast(`Signed in via ${provider} ✓`,'success'); return {success:true}; }
      if(r?.data?.status==='pending') return {success:true,pending:true};
      return {success:false,error:r?.error||'Failed'};
    }catch(err){ return {success:false,error:err.message}; }
  }

  async function logout(){
    await API.logout(); setUser(null); setIsAdmin(false);
    setCart([]); await AsyncStorage.removeItem(K.cart);
    showToast('Logged out. See you soon 👋','info');
  }

  // Cart
  const cartCount = cart.reduce((s,i)=>s+i.qty,0);
  const cartTotal = cart.reduce((s,i)=>s+parseFloat(i.price||0)*i.qty,0);
  async function addToCart(item){
    const ex=cart.find(i=>i.id===item.id);
    let updated;
    if(ex) updated=cart.map(i=>i.id===item.id?{...i,qty:i.qty+1}:i);
    else   updated=[...cart,{...item,qty:1}];
    setCart(updated); await AsyncStorage.setItem(K.cart,JSON.stringify(updated));
    showToast(`${item.name} added to cart ✓`,'success');
  }
  async function removeFromCart(id){ const u=cart.filter(i=>i.id!==id); setCart(u); await AsyncStorage.setItem(K.cart,JSON.stringify(u)); }
  async function changeQty(id,d){ const u=cart.map(i=>i.id===id?{...i,qty:i.qty+d}:i).filter(i=>i.qty>0); setCart(u); await AsyncStorage.setItem(K.cart,JSON.stringify(u)); }
  async function clearCart(){ setCart([]); await AsyncStorage.removeItem(K.cart); }

  // Local admin actions
  async function adminApproveUser(uid){ const u=localUsers.map(u=>u.id===uid?{...u,status:'approved'}:u); setLocalUsers(u); await AsyncStorage.setItem(K.users,JSON.stringify(u)); }
  async function adminRejectUser(uid){ const u=localUsers.map(u=>u.id===uid?{...u,status:'rejected'}:u); setLocalUsers(u); await AsyncStorage.setItem(K.users,JSON.stringify(u)); }
  async function adminDeleteUser(uid){ const u=localUsers.filter(u=>u.id!==uid); setLocalUsers(u); await AsyncStorage.setItem(K.users,JSON.stringify(u)); }
  async function adminApproveItem(iid){ const u=localItems.map(i=>i.id===iid?{...i,status:'approved'}:i); setLocalItems(u); await AsyncStorage.setItem(K.items,JSON.stringify(u)); }
  async function adminRejectItem(iid){ const u=localItems.map(i=>i.id===iid?{...i,status:'rejected'}:i); setLocalItems(u); await AsyncStorage.setItem(K.items,JSON.stringify(u)); }
  async function adminDeleteItem(iid){ const u=localItems.filter(i=>i.id!==iid); setLocalItems(u); await AsyncStorage.setItem(K.items,JSON.stringify(u)); }

  async function postItem(data){ const ni={...data,id:Date.now(),status:'pending',seller_name:user?.name||'You',created_at:new Date().toLocaleDateString()}; const u=[ni,...localItems]; setLocalItems(u); await AsyncStorage.setItem(K.items,JSON.stringify(u)); }

  async function checkout(){
    const num='KBM-'+Date.now().toString().slice(-8);
    const r={id:num,date:new Date().toLocaleDateString('en-KE'),time:new Date().toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'}),buyer:user?.name||'Guest',buyerEmail:user?.email||'',items:[...cart],total:cartTotal,itemCount:cartCount};
    try{ await API.receipt(cart,cartTotal); }catch(_){}
    const u=[r,...localReceipts]; setLocalReceipts(u); await AsyncStorage.setItem(K.receipts,JSON.stringify(u));
    await clearCart();
    showToast('Order placed! Receipt saved ✓','success');
    return r;
  }

  return (
    <AppCtx.Provider value={{
      user,isAdmin,cart,cartCount,cartTotal,toast,
      localUsers,localItems,localReceipts,
      login,register,socialLogin,logout,
      addToCart,removeFromCart,changeQty,clearCart,checkout,
      adminApproveUser,adminRejectUser,adminDeleteUser,
      adminApproveItem,adminRejectItem,adminDeleteItem,
      postItem, showToast,
    }}>
      {children}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </AppCtx.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SHARED UI COMPONENTS
═══════════════════════════════════════════════════════════════ */
function Toast({ msg, type }){
  const bg={ success:C.green, error:C.red, info:C.g3, warning:C.gold }[type]||C.g3;
  return (
    <View style={{ position:'absolute', bottom:90, left:20, right:20, zIndex:9999 }}>
      <View style={{ backgroundColor:bg, borderRadius:14, padding:14, flexDirection:'row', alignItems:'center', ...C.shMd }}>
        <Text style={{ fontSize:18, marginRight:10 }}>{ {success:'✅',error:'❌',info:'💬',warning:'⚠️'}[type]||'💬' }</Text>
        <Text style={{ color:'#fff', fontWeight:'700', fontSize:SZ.sm, flex:1 }}>{msg}</Text>
      </View>
    </View>
  );
}

function Btn({ label, onPress, variant='primary', icon, style, disabled, small }){
  const h = small ? 40 : 52;
  if(variant==='primary') return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85} style={[{borderRadius:14,overflow:'hidden',...C.shMd},style]}>
      <LinearGradient colors={C.gGold} style={{height:h,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8}} start={{x:0,y:0}} end={{x:1,y:0}}>
        {icon&&<Ionicons name={icon} size={small?14:18} color="#050a05"/>}
        <Text style={{fontWeight:'800',fontSize:small?SZ.xs:SZ.base,color:'#050a05'}}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
  if(variant==='outline') return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85} style={[{height:h,borderWidth:1.5,borderColor:C.bdr,borderRadius:14,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8,backgroundColor:C.surf},C.sh,style]}>
      {icon&&<Ionicons name={icon} size={18} color={C.t2}/>}
      <Text style={{fontWeight:'700',fontSize:SZ.base,color:C.t2}}>{label}</Text>
    </TouchableOpacity>
  );
  if(variant==='danger') return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85} style={[{height:h,backgroundColor:'rgba(220,38,38,0.1)',borderWidth:1.5,borderColor:'rgba(220,38,38,0.3)',borderRadius:14,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8},style]}>
      {icon&&<Ionicons name={icon} size={16} color={C.red}/>}
      <Text style={{fontWeight:'700',fontSize:SZ.sm,color:C.red}}>{label}</Text>
    </TouchableOpacity>
  );
  if(variant==='green') return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85} style={[{height:h,borderRadius:14,overflow:'hidden',...C.shMd},style]}>
      <LinearGradient colors={C.gGreenM} style={{flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8}}>
        {icon&&<Ionicons name={icon} size={small?14:18} color="#fff"/>}
        <Text style={{fontWeight:'800',fontSize:small?SZ.xs:SZ.base,color:'#fff'}}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
  return null;
}

function Field({ label, value, onChangeText, placeholder, secure, type, error, multiline }){
  const [show,setShow]=useState(false);
  return (
    <View style={{marginBottom:16}}>
      <Text style={{fontWeight:'800',fontSize:SZ.xs,color:C.t1,textTransform:'uppercase',letterSpacing:0.8,marginBottom:7}}>{label}</Text>
      <View style={{flexDirection:'row',alignItems:multiline?'flex-start':'center',backgroundColor:C.inp,borderRadius:14,borderWidth:2,borderColor:error?C.red:C.bdr,paddingHorizontal:14,minHeight:multiline?100:52}}>
        <TextInput
          style={{flex:1,fontSize:SZ.base,color:C.t1,paddingVertical:multiline?12:0}}
          placeholder={placeholder} placeholderTextColor={C.t4}
          value={value} onChangeText={onChangeText}
          secureTextEntry={secure&&!show}
          keyboardType={type==='email'?'email-address':type==='phone'?'phone-pad':type==='number'?'numeric':'default'}
          autoCapitalize={type==='email'?'none':'sentences'}
          multiline={multiline} textAlignVertical={multiline?'top':'center'}
        />
        {secure&&<TouchableOpacity onPress={()=>setShow(!show)} style={{padding:6}}><Ionicons name={show?'eye-off-outline':'eye-outline'} size={18} color={C.t3}/></TouchableOpacity>}
      </View>
      {error?<Text style={{color:C.red,fontSize:SZ.xs,marginTop:4,marginLeft:2}}>{error}</Text>:null}
    </View>
  );
}

function StatusPill({ status, small }){
  const map={approved:{bg:'rgba(22,163,74,0.1)',border:'rgba(22,163,74,0.3)',text:C.green,label:'✅ Approved'},pending:{bg:'rgba(212,147,10,0.12)',border:'rgba(212,147,10,0.4)',text:C.gold,label:'⏳ Pending'},rejected:{bg:'rgba(220,38,38,0.1)',border:'rgba(220,38,38,0.3)',text:C.red,label:'❌ Rejected'},sold:{bg:'rgba(37,99,235,0.1)',border:'rgba(37,99,235,0.3)',text:C.blue,label:'🏷️ Sold'},suspended:{bg:'rgba(124,58,237,0.1)',border:'rgba(124,58,237,0.3)',text:C.purple,label:'🚫 Suspended'}};
  const s=map[status]||map.pending;
  return <View style={{backgroundColor:s.bg,borderWidth:1,borderColor:s.border,borderRadius:20,paddingHorizontal:small?8:12,paddingVertical:small?2:4,alignSelf:'flex-start'}}><Text style={{fontWeight:'800',fontSize:small?9:11,color:s.text}}>{s.label}</Text></View>;
}

function ScreenHeader({ title, subtitle, onBack, right }){
  return (
    <LinearGradient colors={C.gGreen} style={{ paddingTop: Platform.OS==='ios'?56:36, paddingBottom:20, paddingHorizontal:20 }}>
      <View style={{flexDirection:'row',alignItems:'center'}}>
        {onBack&&<TouchableOpacity onPress={onBack} style={{marginRight:12,backgroundColor:'rgba(255,255,255,0.1)',borderRadius:12,padding:8}}><Ionicons name="arrow-back" size={20} color="#fff"/></TouchableOpacity>}
        <View style={{flex:1}}>
          <Text style={{fontWeight:'800',fontSize:SZ.xl,color:'#fff'}}>{title}</Text>
          {subtitle&&<Text style={{fontSize:SZ.xs,color:'rgba(255,255,255,0.45)',marginTop:2}}>{subtitle}</Text>}
        </View>
        {right}
      </View>
    </LinearGradient>
  );
}

function ItemCard({ item, onPress, onAddCart, inCart }){
  const cat=(item.cat||item.category_name||'other').toLowerCase();
  const bg=CAT_BG[cat]||CAT_BG.other;
  const em=item.emoji||item.category_emoji||CAT_EMOJI[cat]||'🎒';
  const price=parseFloat(item.price||0);
  return (
    <TouchableOpacity style={[{width:(W-48)/2,backgroundColor:C.card,borderRadius:20,overflow:'hidden',borderWidth:1,borderColor:C.bdr,...C.sh,marginBottom:12}]} onPress={onPress} activeOpacity={0.92}>
      <View style={{height:130,position:'relative'}}>
        {item.image_url
          ?<Image source={{uri:item.image_url}} style={{width:'100%',height:'100%'}}/>
          :<LinearGradient colors={bg} style={{width:'100%',height:'100%',alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:44}}>{em}</Text></LinearGradient>
        }
        <View style={{position:'absolute',top:8,left:8,backgroundColor:item.condition==='new'?C.g3:'rgba(0,0,0,0.4)',borderRadius:20,paddingHorizontal:8,paddingVertical:3}}>
          <Text style={{color:'#fff',fontSize:9,fontWeight:'800'}}>{item.condition==='new'?'New':'Used'}</Text>
        </View>
        {inCart&&<View style={{position:'absolute',top:8,right:8,backgroundColor:C.green,borderRadius:8,padding:4}}><Ionicons name="cart" size={12} color="#fff"/></View>}
      </View>
      <View style={{padding:10}}>
        <Text style={{fontWeight:'700',fontSize:SZ.sm,color:C.t1,marginBottom:3}} numberOfLines={2}>{item.name}</Text>
        <View style={{flexDirection:'row',alignItems:'center',marginBottom:5}}><Ionicons name="location-outline" size={10} color={C.t3}/><Text style={{fontSize:10,color:C.t3,marginLeft:2,flex:1}} numberOfLines={1}>{item.location||item.loc||''}</Text></View>
        <Text style={{fontWeight:'800',fontSize:SZ.base,color:C.g2,marginBottom:8}}>KSh {price.toLocaleString()}</Text>
        <TouchableOpacity style={{backgroundColor:inCart?C.g4:C.g3,borderRadius:8,flexDirection:'row',alignItems:'center',justifyContent:'center',paddingVertical:7,gap:4}} onPress={onAddCart} activeOpacity={0.8}>
          <Ionicons name="cart-outline" size={13} color="#fff"/>
          <Text style={{fontWeight:'700',fontSize:SZ.xs,color:'#fff'}}>{inCart?'In Cart':'Add to Cart'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AUTH SCREENS
═══════════════════════════════════════════════════════════════ */
function LandingScreen({ navigation }){
  return (
    <LinearGradient colors={[C.g1,C.g2,C.g3]} style={{flex:1,paddingHorizontal:28,justifyContent:'space-between',paddingTop:80,paddingBottom:40}}>
      <ExpoStatusBar style="light"/>
      <View style={{alignItems:'center'}}>
        <View style={{width:100,height:100,backgroundColor:C.gold2,borderRadius:28,alignItems:'center',justifyContent:'center',marginBottom:22,shadowColor:C.gold,shadowOffset:{width:0,height:14},shadowOpacity:0.55,shadowRadius:28,elevation:18}}>
          <Text style={{fontSize:48}}>🛒</Text>
        </View>
        <Text style={{fontWeight:'800',fontSize:36,color:'#fff',letterSpacing:-0.5,marginBottom:4}}>Kabianga<Text style={{color:C.gold2}}>Market</Text></Text>
        <Text style={{fontSize:SZ.xs,color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:2,marginBottom:20}}>University of Kabianga</Text>
        <Text style={{fontSize:SZ.base,color:'rgba(255,255,255,0.5)',textAlign:'center',lineHeight:24}}>Buy & sell second-hand items safely{'\n'}within the UoK community</Text>
      </View>
      <View style={{flexDirection:'row',justifyContent:'center',gap:36}}>
        {[['1.2K+','Listings'],['890+','Students'],['45+','Villages']].map(([n,l])=>(
          <View key={l} style={{alignItems:'center'}}><Text style={{fontWeight:'800',fontSize:SZ['2xl'],color:C.gold2}}>{n}</Text><Text style={{fontSize:SZ.xs,color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:1}}>{l}</Text></View>
        ))}
      </View>
      <View style={{gap:14}}>
        <Btn label="🛍️  Start Shopping" onPress={()=>navigation.navigate('Login')}/>
        <Btn label="🏪  Sell an Item" onPress={()=>navigation.navigate('Register')} variant="outline" style={{borderColor:'rgba(255,255,255,0.25)',backgroundColor:'rgba(255,255,255,0.07)'}}/>
        <TouchableOpacity onPress={()=>navigation.navigate('Login')} style={{alignItems:'center',padding:8}}>
          <Text style={{fontWeight:'700',fontSize:SZ.sm,color:'rgba(255,255,255,0.25)'}}>Admin Login →</Text>
        </TouchableOpacity>
      </View>
      <Text style={{textAlign:'center',fontSize:10,color:'rgba(255,255,255,0.15)'}}>© 2025 KabiangaMarket · Admin-Verified Listings</Text>
    </LinearGradient>
  );
}

function LoginScreen({ navigation }){
  const { login, showToast } = useApp();
  const [email,setEmail]=useState('');
  const [pw,setPw]=useState('');
  const [loading,setLoading]=useState(false);
  const [errs,setErrs]=useState({});
  const [socialModal,setSocialModal]=useState(null);
  const [scEmail,setScEmail]=useState('');
  const [scName,setScName]=useState('');

  async function doLogin(){
    const e={};
    if(!email||!email.includes('@')) e.email='Enter a valid email';
    if(!pw||pw.length<6) e.pw='Password must be at least 6 characters';
    if(Object.keys(e).length){setErrs(e);return;}
    setLoading(true);
    const r=await login(email.trim().toLowerCase(),pw);
    setLoading(false);
    if(!r.success) setErrs({pw:r.error||'Login failed'});
  }

  async function completeSocial(){
    if(!scEmail||!scEmail.includes('@')){showToast('Enter a valid email','error');return;}
    if(!scName||scName.trim().length<2){showToast('Enter your full name','error');return;}
    const { socialLogin } = useApp();
    setSocialModal(null);
    const r=await socialLogin(socialModal,scEmail.trim().toLowerCase(),scName.trim());
    if(r.pending) showToast('Account pending admin approval ⏳','info');
    else if(!r.success) showToast(r.error||'Failed','error');
  }

  const SOCIALS=[
    {id:'google',label:'Google',ico:'logo-google',bg:'#fff',iconColor:'#4285F4',bdr:'#e8e8e8'},
    {id:'facebook',label:'Facebook',ico:'logo-facebook',bg:'#1877F2',iconColor:'#fff',bdr:'#1877F2'},
    {id:'github',label:'GitHub',ico:'logo-github',bg:'#24292e',iconColor:'#fff',bdr:'#24292e'},
    {id:'twitter',label:'X / Twitter',ico:'logo-twitter',bg:'#000',iconColor:'#fff',bdr:'#000'},
  ];

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
      <ScrollView style={{flex:1,backgroundColor:C.bg}} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={C.gGreen} style={{paddingTop:56,paddingBottom:32,paddingHorizontal:24,alignItems:'center'}}>
          <TouchableOpacity onPress={()=>navigation.goBack()} style={{position:'absolute',top:56,left:20,backgroundColor:'rgba(255,255,255,0.1)',padding:8,borderRadius:12}}>
            <Ionicons name="arrow-back" size={20} color="#fff"/>
          </TouchableOpacity>
          <View style={{width:72,height:72,backgroundColor:C.gold2,borderRadius:20,alignItems:'center',justifyContent:'center',marginBottom:14,shadowColor:C.gold,shadowOffset:{width:0,height:8},shadowOpacity:0.4,shadowRadius:16,elevation:10}}>
            <Text style={{fontSize:34}}>🛒</Text>
          </View>
          <Text style={{fontWeight:'800',fontSize:SZ['2xl'],color:'#fff',marginBottom:4}}>Welcome Back!</Text>
          <Text style={{fontSize:SZ.xs,color:'rgba(255,255,255,0.45)'}}>Sign in to KabiangaMarket</Text>
        </LinearGradient>

        <View style={{backgroundColor:C.surf,borderRadius:32,margin:16,padding:24,marginTop:-20,...C.shMd}}>
          <Field label="Email Address" value={email} onChangeText={t=>{setEmail(t);setErrs(e=>({...e,email:''}));}} placeholder="you@kabianga.ac.ke" type="email" error={errs.email}/>
          <Field label="Password" value={pw} onChangeText={t=>{setPw(t);setErrs(e=>({...e,pw:''}));}} placeholder="••••••••" secure error={errs.pw}/>
          <TouchableOpacity onPress={()=>navigation.navigate('Forgot')} style={{alignSelf:'flex-end',marginBottom:20,marginTop:-8}}>
            <Text style={{fontWeight:'700',fontSize:SZ.sm,color:C.g4}}>Forgot Password?</Text>
          </TouchableOpacity>
          <Btn label={loading?'Signing in…':'Sign In →'} onPress={doLogin} disabled={loading}/>
          <View style={{flexDirection:'row',alignItems:'center',marginVertical:20}}>
            <View style={{flex:1,height:1,backgroundColor:C.bdr}}/><Text style={{marginHorizontal:12,fontWeight:'700',fontSize:SZ.xs,color:C.t3,textTransform:'uppercase',letterSpacing:0.8}}>or continue with</Text><View style={{flex:1,height:1,backgroundColor:C.bdr}}/>
          </View>
          {SOCIALS.map(s=>(
            <TouchableOpacity key={s.id} onPress={()=>{setSocialModal(s.id);setScEmail('');setScName('');}} style={{flexDirection:'row',alignItems:'center',borderWidth:1.5,borderColor:s.bdr,borderRadius:14,paddingVertical:12,paddingHorizontal:16,marginBottom:10,...C.sh}} activeOpacity={0.8}>
              <View style={{width:32,height:32,backgroundColor:s.bg,borderRadius:9,alignItems:'center',justifyContent:'center',marginRight:12}}><Ionicons name={s.ico} size={17} color={s.iconColor}/></View>
              <Text style={{flex:1,fontWeight:'700',fontSize:SZ.sm,color:C.t1}}>Continue with {s.label}</Text>
              <Ionicons name="chevron-forward" size={14} color={C.t4}/>
            </TouchableOpacity>
          ))}
          <View style={{flexDirection:'row',justifyContent:'center',marginTop:18}}>
            <Text style={{fontSize:SZ.sm,color:C.t2}}>Don't have an account? </Text>
            <TouchableOpacity onPress={()=>navigation.navigate('Register')}><Text style={{fontWeight:'800',fontSize:SZ.sm,color:C.g4}}>Create one →</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Social Modal */}
      <Modal visible={!!socialModal} transparent animationType="slide" onRequestClose={()=>setSocialModal(null)}>
        <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.55)',alignItems:'center',justifyContent:'center',padding:20}}>
          <View style={{backgroundColor:'#fff',borderRadius:24,padding:28,width:'100%',...C.shMd}}>
            <Text style={{fontWeight:'800',fontSize:SZ.xl,color:C.t1,textAlign:'center',marginBottom:4}}>🔗 Complete Sign-In</Text>
            <Text style={{fontSize:SZ.sm,color:C.t2,textAlign:'center',marginBottom:20}}>Signed in via {socialModal}. Confirm your details:</Text>
            <Field label="Full Name" value={scName} onChangeText={setScName} placeholder="Your full name"/>
            <Field label="Email Address" value={scEmail} onChangeText={setScEmail} placeholder="your@email.com" type="email"/>
            <View style={{flexDirection:'row',gap:12,marginTop:8}}>
              <TouchableOpacity style={{flex:1,backgroundColor:C.inp,borderRadius:12,padding:14,alignItems:'center'}} onPress={()=>setSocialModal(null)}><Text style={{fontWeight:'700',color:C.t2}}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={{flex:1,backgroundColor:C.g3,borderRadius:12,padding:14,alignItems:'center'}} onPress={completeSocial}><Text style={{fontWeight:'700',color:'#fff'}}>Continue ✓</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function RegisterScreen({ navigation }){
  const { register, showToast } = useApp();
  const [form,setForm]=useState({name:'',email:'',phone:'',pw:''});
  const [loading,setLoading]=useState(false);
  const [errs,setErrs]=useState({});
  const [pendingModal,setPendingModal]=useState(false);
  const set=k=>v=>setForm(f=>({...f,[k]:v}));

  async function doRegister(){
    const e={};
    if(!form.name||form.name.trim().split(' ').length<2) e.name='Enter at least 2 names';
    if(!form.email||!form.email.includes('@')) e.email='Enter a valid email';
    if(!form.pw||form.pw.length<6) e.pw='Password must be at least 6 characters';
    if(Object.keys(e).length){setErrs(e);return;}
    setLoading(true);
    const r=await register(form.name.trim(),form.email.trim().toLowerCase(),form.phone.trim(),form.pw);
    setLoading(false);
    if(r.success&&r.pending) setPendingModal(true);
    else if(!r.success) setErrs({email:r.error||'Registration failed'});
  }

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
      <ScrollView style={{flex:1,backgroundColor:C.bg}} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={C.gGreen} style={{paddingTop:56,paddingBottom:32,paddingHorizontal:24,alignItems:'center'}}>
          <TouchableOpacity onPress={()=>navigation.goBack()} style={{position:'absolute',top:56,left:20,backgroundColor:'rgba(255,255,255,0.1)',padding:8,borderRadius:12}}>
            <Ionicons name="arrow-back" size={20} color="#fff"/>
          </TouchableOpacity>
          <View style={{width:72,height:72,backgroundColor:C.gold2,borderRadius:20,alignItems:'center',justifyContent:'center',marginBottom:14,elevation:10}}>
            <Text style={{fontSize:34}}>✨</Text>
          </View>
          <Text style={{fontWeight:'800',fontSize:SZ['2xl'],color:'#fff',marginBottom:4}}>Join the Community!</Text>
          <Text style={{fontSize:SZ.xs,color:'rgba(255,255,255,0.45)'}}>Create your free account</Text>
        </LinearGradient>
        <View style={{backgroundColor:C.surf,borderRadius:32,margin:16,padding:24,marginTop:-20,...C.shMd}}>
          <View style={{backgroundColor:'rgba(212,147,10,0.08)',borderWidth:1,borderColor:'rgba(212,147,10,0.25)',borderRadius:12,padding:12,marginBottom:18,flexDirection:'row',alignItems:'center',gap:8}}>
            <Ionicons name="shield-checkmark-outline" size:18 color={C.gold}/>
            <Text style={{fontSize:SZ.xs,color:C.gold,flex:1,fontWeight:'600'}}>Your account requires admin approval before you can log in. You'll be notified once approved.</Text>
          </View>
          <Field label="Full Names" value={form.name} onChangeText={set('name')} placeholder="e.g. Jane Wanjiru Mwangi" error={errs.name}/>
          <Field label="Email Address" value={form.email} onChangeText={set('email')} placeholder="you@kabianga.ac.ke" type="email" error={errs.email}/>
          <Field label="Phone Number" value={form.phone} onChangeText={set('phone')} placeholder="+254 712 345 678" type="phone"/>
          <Field label="Password" value={form.pw} onChangeText={set('pw')} placeholder="Create a strong password" secure error={errs.pw}/>
          <Btn label={loading?'Creating account…':'Create Account'} icon="person-add" onPress={doRegister} disabled={loading}/>
          <View style={{flexDirection:'row',justifyContent:'center',marginTop:18}}>
            <Text style={{fontSize:SZ.sm,color:C.t2}}>Already a member? </Text>
            <TouchableOpacity onPress={()=>navigation.navigate('Login')}><Text style={{fontWeight:'800',fontSize:SZ.sm,color:C.g4}}>Sign in →</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Modal visible={pendingModal} transparent animationType="fade">
        <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.6)',alignItems:'center',justifyContent:'center',padding:24}}>
          <View style={{backgroundColor:'#fff',borderRadius:28,padding:32,alignItems:'center',...C.shMd}}>
            <Text style={{fontSize:52,marginBottom:12}}>⏳</Text>
            <Text style={{fontWeight:'800',fontSize:SZ.xl,color:C.t1,marginBottom:8,textAlign:'center'}}>Approval Pending</Text>
            <Text style={{fontSize:SZ.sm,color:C.t2,textAlign:'center',marginBottom:24,lineHeight:22}}>Thank you for registering!{'\n'}Your account is awaiting admin approval.{'\n'}You'll be able to log in once approved.</Text>
            <Btn label="Back to Login" onPress={()=>{setPendingModal(false);navigation.navigate('Login');}} style={{width:'100%'}}/>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function ForgotScreen({ navigation }){
  const { localUsers, showToast } = useApp();
  const [email,setEmail]=useState('');
  const [np,setNp]=useState('');
  const [cp,setCp]=useState('');
  function doReset(){
    if(!email||!email.includes('@')){showToast('Enter a valid email','error');return;}
    if(np.length<6){showToast('Password must be at least 6 characters','error');return;}
    if(np!==cp){showToast('Passwords do not match','error');return;}
    showToast('Password reset successfully ✓','success');
    setTimeout(()=>navigation.navigate('Login'),1200);
  }
  return (
    <KeyboardAvoidingView style={{flex:1,backgroundColor:C.bg}} behavior={Platform.OS==='ios'?'padding':undefined}>
      <ScreenHeader title="Reset Password" subtitle="Enter your email and new password" onBack={()=>navigation.goBack()}/>
      <ScrollView contentContainerStyle={{padding:20}}>
        <View style={{backgroundColor:C.surf,borderRadius:24,padding:24,...C.sh}}>
          <Field label="Email Address" value={email} onChangeText={setEmail} placeholder="you@kabianga.ac.ke" type="email"/>
          <Field label="New Password" value={np} onChangeText={setNp} placeholder="New password" secure/>
          <Field label="Confirm Password" value={cp} onChangeText={setCp} placeholder="Confirm password" secure/>
          <Btn label="Reset Password" icon="checkmark" onPress={doReset}/>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ═══════════════════════════════════════════════════════════════
   USER SCREENS
═══════════════════════════════════════════════════════════════ */
function HomeScreen({ navigation }){
  const { user, addToCart, cart } = useApp();
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [refreshing,setRefreshing]=useState(false);
  const [cat,setCatState]=useState('all');
  const [search,setSearch]=useState('');

  const load=useCallback(async(c=cat,q=search)=>{
    try{
      const r=await API.items(c==='all'?'':c,q);
      if(r?.offline){ setItems(SAMPLE_ITEMS.filter(i=>i.status==='approved'&&(c==='all'||i.cat===c)&&(!q||i.name.toLowerCase().includes(q.toLowerCase())))); }
      else if(r?.data?.items) setItems(r.data.items);
    }catch(_){ setItems(SAMPLE_ITEMS.filter(i=>i.status==='approved')); }
    finally{ setLoading(false);setRefreshing(false); }
  },[]);

  useEffect(()=>{load();},[]);

  const h=new Date().getHours();
  const greet=h<12?'Good morning':h<17?'Good afternoon':'Good evening';

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}} edges={['top']}>
      <ExpoStatusBar style="light"/>
      <LinearGradient colors={C.gGreen} style={{paddingHorizontal:20,paddingTop:8,paddingBottom:20}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
          <View>
            <Text style={{fontSize:SZ.xs,color:'rgba(255,255,255,0.45)',marginBottom:2}}>{greet}, {user?.name?.split(' ')[0]||'there'} 👋</Text>
            <Text style={{fontWeight:'800',fontSize:SZ['2xl'],color:'#fff'}}>Find great deals</Text>
          </View>
          <TouchableOpacity onPress={()=>navigation.navigate('Cart')} style={{width:44,height:44,backgroundColor:'rgba(255,255,255,0.1)',borderRadius:14,alignItems:'center',justifyContent:'center',position:'relative'}}>
            <Ionicons name="cart-outline" size={24} color="#fff"/>
            {cart.reduce((t,i)=>t+i.qty,0)>0&&<View style={{position:'absolute',top:-2,right:-2,backgroundColor:C.red,borderRadius:8,minWidth:16,height:16,alignItems:'center',justifyContent:'center',paddingHorizontal:3}}><Text style={{color:'#fff',fontSize:9,fontWeight:'800'}}>{cart.reduce((t,i)=>t+i.qty,0)}</Text></View>}
          </TouchableOpacity>
        </View>
        <View style={{flexDirection:'row',gap:10}}>
          <View style={{flex:1,flexDirection:'row',alignItems:'center',backgroundColor:'rgba(255,255,255,0.12)',borderRadius:14,paddingHorizontal:14,height:46,gap:8}}>
            <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.6)"/>
            <TextInput style={{flex:1,fontSize:SZ.sm,color:'#fff'}} placeholder="Search items…" placeholderTextColor="rgba(255,255,255,0.35)" value={search} onChangeText={setSearch} onSubmitEditing={()=>load(cat,search)} returnKeyType="search"/>
          </View>
          <TouchableOpacity style={{width:46,height:46,backgroundColor:C.gold2,borderRadius:14,alignItems:'center',justifyContent:'center'}} onPress={()=>load(cat,search)}>
            <Ionicons name="search" size={18} color="#050a05"/>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{backgroundColor:C.surf,maxHeight:52}} contentContainerStyle={{paddingHorizontal:14,paddingVertical:10,gap:8}}>
        {CATS.map(c=>(
          <TouchableOpacity key={c.slug} style={{flexDirection:'row',alignItems:'center',paddingHorizontal:14,paddingVertical:7,borderRadius:50,backgroundColor:cat===c.slug?C.g3:C.inp,borderWidth:1.5,borderColor:cat===c.slug?C.g3:C.bdr,marginRight:8}} onPress={()=>{setCatState(c.slug);load(c.slug,search);}}>
            <Text style={{fontSize:13,marginRight:5}}>{c.emoji}</Text>
            <Text style={{fontWeight:'700',fontSize:SZ.xs,color:cat===c.slug?'#fff':C.t2}}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading
        ?<View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator size="large" color={C.g4}/><Text style={{marginTop:12,color:C.t3,fontSize:SZ.sm}}>Loading marketplace…</Text></View>
        :<FlatList
          data={items} keyExtractor={i=>String(i.id)} numColumns={2}
          columnWrapperStyle={{justifyContent:'space-between',paddingHorizontal:16}}
          contentContainerStyle={{paddingTop:12,paddingBottom:90}}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);load();}} tintColor={C.g4}/>}
          renderItem={({item})=>(
            <ItemCard item={item} onPress={()=>navigation.navigate('Detail',{item})} onAddCart={()=>addToCart(item)} inCart={!!cart.find(c=>c.id===item.id)}/>
          )}
          ListHeaderComponent={<View style={{paddingHorizontal:16,paddingBottom:8}}><Text style={{fontWeight:'700',fontSize:SZ.sm,color:C.t3}}>{items.length} items available</Text></View>}
          ListEmptyComponent={<View style={{alignItems:'center',paddingTop:60}}><Text style={{fontSize:64,marginBottom:12}}>🔍</Text><Text style={{fontWeight:'800',fontSize:SZ.xl,color:C.t1,marginBottom:6}}>No items found</Text><Text style={{fontSize:SZ.sm,color:C.t3,textAlign:'center'}}>Try a different search or category</Text></View>}
        />
      }
    </SafeAreaView>
  );
}

function DetailScreen({ route, navigation }){
  const { item } = route.params;
  const { addToCart, cart, showToast } = useApp();
  const cat=(item.cat||item.category_name||'other').toLowerCase();
  const bg=CAT_BG[cat]||CAT_BG.other;
  const em=item.emoji||item.category_emoji||CAT_EMOJI[cat]||'🎒';
  const inCart=!!cart.find(c=>c.id===item.id);
  const [chatVisible,setChatVisible]=useState(false);
  const [msgs,setMsgs]=useState([{from:'seller',text:`Hi! I'm selling ${item.name} for KSh ${parseFloat(item.price).toLocaleString()}. Feel free to ask!`,time:new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})}]);
  const [msg,setMsg]=useState('');

  function sendMsg(){
    if(!msg.trim())return;
    const t=new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
    setMsgs(m=>[...m,{from:'me',text:msg.trim(),time:t}]);
    setMsg('');
    setTimeout(()=>setMsgs(m=>[...m,{from:'seller',text:AUTO_REPLIES[Math.floor(Math.random()*AUTO_REPLIES.length)],time:new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})}]),1200);
  }

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}} edges={['top']}>
      <ScrollView>
        <View style={{height:260,backgroundColor:C.inp,position:'relative'}}>
          {item.image_url?<Image source={{uri:item.image_url}} style={{width:'100%',height:'100%'}}/>:<LinearGradient colors={bg} style={{width:'100%',height:'100%',alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:80}}>{em}</Text></LinearGradient>}
          <TouchableOpacity onPress={()=>navigation.goBack()} style={{position:'absolute',top:16,left:16,backgroundColor:'rgba(0,0,0,0.45)',padding:10,borderRadius:14}}><Ionicons name="arrow-back" size={20} color="#fff"/></TouchableOpacity>
          <View style={{position:'absolute',top:16,right:16,backgroundColor:item.condition==='new'?C.g3:'rgba(0,0,0,0.45)',paddingHorizontal:12,paddingVertical:5,borderRadius:20}}><Text style={{color:'#fff',fontWeight:'800',fontSize:SZ.xs}}>{item.condition==='new'?'Like New':'Used'}</Text></View>
        </View>

        <View style={{backgroundColor:C.surf,borderRadius:28,margin:16,marginTop:-24,padding:20,...C.shMd}}>
          <Text style={{fontWeight:'800',fontSize:SZ['2xl'],color:C.t1,marginBottom:6}}>{item.name}</Text>
          <Text style={{fontWeight:'800',fontSize:28,color:C.g2,marginBottom:14}}>KSh {parseFloat(item.price||0).toLocaleString()}</Text>
          <View style={{gap:8,marginBottom:16}}>
            {[['location-outline',item.location||item.loc||''],['person-outline',item.seller_name||item.seller||''],['call-outline',item.phone||'']].map(([ico,val],i)=>val?(
              <View key={i} style={{flexDirection:'row',alignItems:'center',gap:8}}><View style={{width:34,height:34,backgroundColor:C.inp,borderRadius:10,alignItems:'center',justifyContent:'center'}}><Ionicons name={ico} size={16} color={C.g4}/></View><Text style={{fontSize:SZ.sm,color:C.t2,flex:1}}>{val}</Text></View>
            ):null)}
          </View>
          {item.description?<View style={{backgroundColor:C.inp,borderRadius:14,padding:14,marginBottom:16}}><Text style={{fontWeight:'700',fontSize:SZ.xs,color:C.t3,textTransform:'uppercase',letterSpacing:0.8,marginBottom:6}}>Description</Text><Text style={{fontSize:SZ.sm,color:C.t2,lineHeight:20}}>{item.description||item.desc||''}</Text></View>:null}

          <View style={{flexDirection:'row',gap:10}}>
            <Btn label={inCart?'In Cart ✓':'Add to Cart'} icon="cart-outline" onPress={()=>addToCart(item)} style={{flex:1}} variant={inCart?'outline':'primary'}/>
            <TouchableOpacity style={{width:52,height:52,backgroundColor:C.g3,borderRadius:14,alignItems:'center',justifyContent:'center',...C.shMd}} onPress={()=>setChatVisible(true)}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff"/>
            </TouchableOpacity>
          </View>

          <View style={{flexDirection:'row',gap:10,marginTop:10}}>
            <TouchableOpacity style={{flex:1,height:48,backgroundColor:'#25D366',borderRadius:14,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8}} onPress={()=>Linking.openURL(`https://wa.me/${(item.phone||WHATSAPP_NUM).replace(/\D/g,'')}?text=Hi! I'm interested in ${item.name}`)}>
              <Ionicons name="logo-whatsapp" size={18} color="#fff"/><Text style={{fontWeight:'700',color:'#fff',fontSize:SZ.sm}}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flex:1,height:48,backgroundColor:C.g3,borderRadius:14,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8}} onPress={()=>Linking.openURL(`tel:${(item.phone||CALL_NUM).replace(/\D/g,'')}`)}>
              <Ionicons name="call-outline" size={18} color="#fff"/><Text style={{fontWeight:'700',color:'#fff',fontSize:SZ.sm}}>Call Seller</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Chat Modal */}
      <Modal visible={chatVisible} animationType="slide" onRequestClose={()=>setChatVisible(false)}>
        <SafeAreaView style={{flex:1,backgroundColor:C.bg}} edges={['top']}>
          <LinearGradient colors={C.gGreen} style={{flexDirection:'row',alignItems:'center',padding:16,gap:12}}>
            <TouchableOpacity onPress={()=>setChatVisible(false)} style={{backgroundColor:'rgba(255,255,255,0.1)',borderRadius:12,padding:8}}><Ionicons name="close" size={20} color="#fff"/></TouchableOpacity>
            <Text style={{fontSize:26}}>{em}</Text>
            <View style={{flex:1}}><Text style={{fontWeight:'800',fontSize:SZ.base,color:'#fff'}}>{item.name}</Text><Text style={{fontSize:SZ.xs,color:C.gold2}}>KSh {parseFloat(item.price).toLocaleString()}</Text></View>
          </LinearGradient>
          <ScrollView style={{flex:1,padding:16}} contentContainerStyle={{gap:10}}>
            {msgs.map((m,i)=>(
              <View key={i} style={{alignSelf:m.from==='me'?'flex-end':'flex-start',maxWidth:'80%'}}>
                <View style={{backgroundColor:m.from==='me'?C.g3:C.surf,borderRadius:18,padding:12,borderBottomRightRadius:m.from==='me'?4:18,borderBottomLeftRadius:m.from==='me'?18:4,borderWidth:m.from==='them'?1:0,borderColor:C.bdr}}>
                  <Text style={{fontSize:SZ.sm,color:m.from==='me'?'#fff':C.t1}}>{m.text}</Text>
                </View>
                <Text style={{fontSize:9,color:C.t4,marginTop:3,textAlign:m.from==='me'?'right':'left'}}>{m.time}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={{flexDirection:'row',gap:10,padding:16,borderTopWidth:1,borderTopColor:C.bdr,backgroundColor:C.surf}}>
            <TextInput style={{flex:1,backgroundColor:C.inp,borderRadius:14,paddingHorizontal:16,paddingVertical:12,fontSize:SZ.sm,color:C.t1,borderWidth:1,borderColor:C.bdr}} placeholder="Type a message…" placeholderTextColor={C.t4} value={msg} onChangeText={setMsg} onSubmitEditing={sendMsg}/>
            <TouchableOpacity style={{width:46,height:46,backgroundColor:C.gold2,borderRadius:14,alignItems:'center',justifyContent:'center',...C.shMd}} onPress={sendMsg}><Ionicons name="send" size={18} color="#050a05"/></TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function CartScreen({ navigation }){
  const { cart, removeFromCart, changeQty, cartTotal, cartCount, checkout, showToast } = useApp();
  const [loading,setLoading]=useState(false);
  const [receipt,setReceipt]=useState(null);

  async function doCheckout(){
    if(!cart.length){showToast('Your cart is empty','error');return;}
    setLoading(true);
    const r=await checkout();
    setLoading(false);
    setReceipt(r);
  }

  if(receipt) return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}} edges={['top']}>
      <ScrollView contentContainerStyle={{padding:20,alignItems:'center'}}>
        <LinearGradient colors={C.gGreen} style={{width:'100%',borderRadius:24,padding:28,alignItems:'center',marginBottom:20}}>
          <View style={{width:72,height:72,backgroundColor:C.gold2,borderRadius:36,alignItems:'center',justifyContent:'center',marginBottom:14,elevation:10}}><Text style={{fontSize:32}}>✓</Text></View>
          <Text style={{fontWeight:'800',fontSize:SZ['2xl'],color:'#fff',marginBottom:4}}>Order Confirmed!</Text>
          <Text style={{fontSize:SZ.xs,color:'rgba(255,255,255,0.5)'}}>Your receipt from KabiangaMarket</Text>
        </LinearGradient>
        <View style={{backgroundColor:C.surf,borderRadius:20,width:'100%',padding:20,...C.sh,marginBottom:16}}>
          <Text style={{fontWeight:'700',fontSize:SZ.xs,color:C.t3,textTransform:'uppercase',letterSpacing:1,textAlign:'center',marginBottom:4}}>Receipt Number</Text>
          <Text style={{fontWeight:'800',fontSize:SZ['2xl'],color:C.g2,textAlign:'center',marginBottom:16}}>#{receipt.id}</Text>
          {receipt.items.map((item,i)=>(
            <View key={i} style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:8,borderBottomWidth:1,borderBottomColor:C.bdr}}>
              <View style={{flexDirection:'row',alignItems:'center',gap:8,flex:1}}>
                <Text style={{fontSize:20}}>{item.emoji||'🎒'}</Text>
                <View style={{flex:1}}><Text style={{fontWeight:'700',fontSize:SZ.sm,color:C.t1}} numberOfLines={1}>{item.name}</Text><Text style={{fontSize:10,color:C.t3}}>{item.qty}× @ KSh {parseFloat(item.price).toLocaleString()}</Text></View>
              </View>
              <Text style={{fontWeight:'700',fontSize:SZ.sm,color:C.g2}}>KSh {(parseFloat(item.price)*item.qty).toLocaleString()}</Text>
            </View>
          ))}
          <View style={{backgroundColor:C.inp,borderRadius:12,padding:14,marginTop:12}}>
            {[['Total Items',receipt.itemCount],['Delivery','Cash on Delivery'],['Total Payable',`KSh ${receipt.total.toLocaleString()}`]].map(([l,v])=>(
              <View key={l} style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:4}}><Text style={{fontSize:SZ.sm,color:C.t2}}>{l}</Text><Text style={{fontWeight:'700',fontSize:SZ.sm,color:C.t1}}>{v}</Text></View>
            ))}
          </View>
        </View>
        <Btn label="Done — Back to Shopping" icon="home-outline" onPress={()=>setReceipt(null)} style={{width:'100%'}}/>
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}} edges={['top']}>
      <ScreenHeader title="🛒 My Cart" subtitle={`${cartCount} item${cartCount!==1?'s':''} · KSh ${cartTotal.toLocaleString()}`}/>
      {!cart.length
        ?<View style={{flex:1,alignItems:'center',justifyContent:'center',padding:32}}>
            <Text style={{fontSize:80,marginBottom:16}}>🛒</Text>
            <Text style={{fontWeight:'800',fontSize:SZ.xl,color:C.t1,marginBottom:8}}>Your cart is empty</Text>
            <Text style={{fontSize:SZ.sm,color:C.t3,marginBottom:24,textAlign:'center'}}>Browse items and add them here</Text>
            <Btn label="Browse Items" icon="shopping-bag-outline" onPress={()=>navigation.goBack()}/>
          </View>
        :<ScrollView contentContainerStyle={{padding:16,gap:12,paddingBottom:180}}>
          {cart.map(item=>(
            <View key={item.id} style={{backgroundColor:C.card,borderRadius:18,padding:16,flexDirection:'row',alignItems:'center',gap:12,...C.sh}}>
              <View style={{width:68,height:68,borderRadius:14,overflow:'hidden',backgroundColor:C.inp,alignItems:'center',justifyContent:'center'}}>{item.image_url?<Image source={{uri:item.image_url}} style={{width:'100%',height:'100%'}}/>:<Text style={{fontSize:32}}>{item.emoji||'🎒'}</Text>}</View>
              <View style={{flex:1}}>
                <Text style={{fontWeight:'700',fontSize:SZ.sm,color:C.t1,marginBottom:2}} numberOfLines={1}>{item.name}</Text>
                <Text style={{fontWeight:'800',fontSize:SZ.lg,color:C.g2}}>KSh {(parseFloat(item.price)*item.qty).toLocaleString()}</Text>
                <Text style={{fontSize:10,color:C.t3}}>@ KSh {parseFloat(item.price).toLocaleString()} each</Text>
              </View>
              <View style={{flexDirection:'row',alignItems:'center',backgroundColor:C.inp,borderRadius:12,padding:4,gap:4}}>
                <TouchableOpacity onPress={()=>changeQty(item.id,-1)} style={{width:32,height:32,backgroundColor:C.g3,borderRadius:9,alignItems:'center',justifyContent:'center'}}><Text style={{color:'#fff',fontSize:18,fontWeight:'700'}}>−</Text></TouchableOpacity>
                <Text style={{fontWeight:'800',fontSize:SZ.lg,minWidth:24,textAlign:'center',color:C.t1}}>{item.qty}</Text>
                <TouchableOpacity onPress={()=>changeQty(item.id,1)} style={{width:32,height:32,backgroundColor:C.g3,borderRadius:9,alignItems:'center',justifyContent:'center'}}><Text style={{color:'#fff',fontSize:18,fontWeight:'700'}}>+</Text></TouchableOpacity>
              </View>
              <TouchableOpacity onPress={()=>removeFromCart(item.id)} style={{padding:8}}><Ionicons name="trash-outline" size={18} color={C.red}/></TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      }
      {cart.length>0&&(
        <View style={{position:'absolute',bottom:0,left:0,right:0,backgroundColor:C.surf,padding:20,borderTopWidth:1,borderTopColor:C.bdr,...C.shMd}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:14}}>
            <Text style={{fontWeight:'700',fontSize:SZ.base,color:C.t2}}>Total ({cartCount} items)</Text>
            <Text style={{fontWeight:'800',fontSize:SZ['2xl'],color:C.g2}}>KSh {cartTotal.toLocaleString()}</Text>
          </View>
          <Btn label={loading?'Processing…':'Checkout →'} icon="lock-closed" onPress={doCheckout} disabled={loading}/>
        </View>
      )}
    </SafeAreaView>
  );
}

function PostItemScreen({ navigation }){
  const { user, postItem, showToast } = useApp();
  const [form,setForm]=useState({name:'',price:'',phone:user?.phone||'',location:'',description:'',condition:'good',cat:'electronics'});
  const [image,setImage]=useState(null);
  const [loading,setLoading]=useState(false);
  const [success,setSuccess]=useState(false);
  const set=k=>v=>setForm(f=>({...f,[k]:v}));

  async function pickImage(){
    const {status}=await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(status!=='granted'){showToast('Photo access denied','error');return;}
    const r=await ImagePicker.launchImageLibraryAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images,allowsEditing:true,aspect:[4,3],quality:0.8});
    if(!r.canceled) setImage(r.assets[0].uri);
  }

  async function doPost(){
    if(!form.name||!form.price||!form.location){showToast('Fill all required fields','error');return;}
    setLoading(true);
    try{
      const r=await API.postItem({...form,category_slug:form.cat,image});
      if(r?.offline||r?.success){ await postItem({...form,image,cat:form.cat,emoji:CAT_EMOJI[form.cat]||'🎒'}); setSuccess(true); }
      else showToast(r?.error||'Failed to post item','error');
    }catch(err){ showToast(err.message,'error'); }
    finally{ setLoading(false); }
  }

  if(success) return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg,alignItems:'center',justifyContent:'center',padding:32}} edges={['top']}>
      <Text style={{fontSize:80,marginBottom:16}}>🎉</Text>
      <Text style={{fontWeight:'800',fontSize:SZ['2xl'],color:C.t1,marginBottom:8,textAlign:'center'}}>Item Submitted!</Text>
      <Text style={{fontSize:SZ.sm,color:C.t2,textAlign:'center',marginBottom:24}}>Your item is now pending admin review. It will appear in the marketplace once approved.</Text>
      <Btn label="Post Another Item" onPress={()=>{setSuccess(false);setForm({name:'',price:'',phone:user?.phone||'',location:'',description:'',condition:'good',cat:'electronics'});setImage(null);}} style={{width:'100%',marginBottom:12}}/>
      <Btn label="Go to Marketplace" onPress={()=>navigation.navigate('Home')} variant="outline" style={{width:'100%'}}/>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}} edges={['top']}>
      <ScreenHeader title="📦 Post an Item" subtitle="Get admin approval to go live"/>
      <ScrollView contentContainerStyle={{padding:16,paddingBottom:40}} keyboardShouldPersistTaps="handled">
        <View style={{backgroundColor:'rgba(212,147,10,0.08)',borderWidth:1,borderColor:'rgba(212,147,10,0.25)',borderRadius:14,padding:14,marginBottom:20,flexDirection:'row',gap:10,alignItems:'flex-start'}}>
          <Ionicons name="shield-checkmark-outline" size={18} color={C.gold} style={{marginTop:1}}/>
          <Text style={{fontSize:SZ.xs,color:C.gold,flex:1,lineHeight:18,fontWeight:'600'}}>Your listing goes to admin for review before appearing publicly. This keeps KabiangaMarket safe and trusted ✅</Text>
        </View>

        {/* Photo */}
        <Text style={{fontWeight:'800',fontSize:SZ.xs,color:C.t1,textTransform:'uppercase',letterSpacing:0.8,marginBottom:8}}>Item Photo</Text>
        <TouchableOpacity style={{height:180,backgroundColor:C.inp,borderRadius:16,borderWidth:2,borderColor:C.bdr,borderStyle:'dashed',alignItems:'center',justifyContent:'center',marginBottom:16,overflow:'hidden'}} onPress={pickImage}>
          {image?<Image source={{uri:image}} style={{width:'100%',height:'100%'}}/>:<View style={{alignItems:'center',gap:8}}><Ionicons name="camera-outline" size={32} color={C.g4}/><Text style={{fontWeight:'700',fontSize:SZ.sm,color:C.t2}}>Tap to add photo</Text><Text style={{fontSize:SZ.xs,color:C.t3}}>PNG, JPG, WEBP · max 10MB</Text></View>}
        </TouchableOpacity>

        {/* Category */}
        <Text style={{fontWeight:'800',fontSize:SZ.xs,color:C.t1,textTransform:'uppercase',letterSpacing:0.8,marginBottom:8}}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:16}} contentContainerStyle={{gap:8}}>
          {CATS.filter(c=>c.slug!=='all').map(c=>(
            <TouchableOpacity key={c.slug} style={{flexDirection:'row',alignItems:'center',paddingHorizontal:14,paddingVertical:10,borderRadius:50,backgroundColor:form.cat===c.slug?C.g3:C.inp,borderWidth:1.5,borderColor:form.cat===c.slug?C.g3:C.bdr,marginRight:8}} onPress={()=>set('cat')(c.slug)}>
              <Text style={{fontSize:14,marginRight:6}}>{c.emoji}</Text>
              <Text style={{fontWeight:'700',fontSize:SZ.xs,color:form.cat===c.slug?'#fff':C.t2}}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Field label="Item Name *" value={form.name} onChangeText={set('name')} placeholder="e.g. Samsung Galaxy A12"/>
        <Field label="Price (KSh) *" value={form.price} onChangeText={set('price')} placeholder="e.g. 5000" type="number"/>
        <Field label="Phone Number *" value={form.phone} onChangeText={set('phone')} placeholder="e.g. 0712 345 678" type="phone"/>
        <Field label="Location *" value={form.location} onChangeText={set('location')} placeholder="e.g. UoK Hostel Block A"/>
        <Field label="Description" value={form.description} onChangeText={set('description')} placeholder="Describe condition, features, reason for selling…" multiline/>

        <Text style={{fontWeight:'800',fontSize:SZ.xs,color:C.t1,textTransform:'uppercase',letterSpacing:0.8,marginBottom:8}}>Condition</Text>
        <View style={{flexDirection:'row',gap:10,marginBottom:24}}>
          {[['new','Like New'],['good','Good'],['fair','Fair']].map(([v,l])=>(
            <TouchableOpacity key={v} style={{flex:1,paddingVertical:12,borderRadius:14,backgroundColor:form.condition===v?C.g3:C.inp,borderWidth:1.5,borderColor:form.condition===v?C.g3:C.bdr,alignItems:'center'}} onPress={()=>set('condition')(v)}>
              <Text style={{fontWeight:'700',fontSize:SZ.sm,color:form.condition===v?'#fff':C.t2}}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Btn label={loading?'Submitting…':'Submit for Approval'} icon="upload-outline" onPress={doPost} disabled={loading}/>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileScreen({ navigation }){
  const { user, logout, localReceipts } = useApp();
  const [loading,setLoading]=useState(false);
  const ini=user?.name?.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase()||'?';

  const MENU=[
    {icon:'cube-outline',label:'My Listings',onPress:()=>navigation.navigate('MyItems')},
    {icon:'receipt-outline',label:'My Receipts',onPress:()=>navigation.navigate('Receipts')},
    {icon:'logo-whatsapp',label:'Contact Admin via WhatsApp',onPress:()=>Linking.openURL(`https://wa.me/${WHATSAPP_NUM.replace(/\D/g,'')}?text=Hello! I need help with KabiangaMarket`)},
    {icon:'call-outline',label:'Call Admin',onPress:()=>Linking.openURL(`tel:${CALL_NUM.replace(/\D/g,'')}`)},
    {icon:'information-circle-outline',label:'About KabiangaMarket',onPress:()=>Alert.alert('KabiangaMarket','University of Kabianga Second-Hand Marketplace\nVersion 1.0.0\n\n© 2025 KabiangaMarket')},
  ];

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}} edges={['top']}>
      <LinearGradient colors={C.gGreen} style={{paddingHorizontal:20,paddingTop:8,paddingBottom:40,alignItems:'center'}}>
        <LinearGradient colors={C.gGold} style={{width:80,height:80,borderRadius:40,alignItems:'center',justifyContent:'center',marginBottom:12,elevation:10}}>
          <Text style={{fontWeight:'800',fontSize:SZ['2xl'],color:'#050a05'}}>{ini}</Text>
        </LinearGradient>
        <Text style={{fontWeight:'800',fontSize:SZ.xl,color:'#fff',marginBottom:4}}>{user?.name||'Guest'}</Text>
        <Text style={{fontSize:SZ.sm,color:'rgba(255,255,255,0.5)'}}>{user?.email}</Text>
        <View style={{marginTop:12,backgroundColor:'rgba(22,163,74,0.25)',borderRadius:20,paddingHorizontal:14,paddingVertical:5,borderWidth:1,borderColor:'rgba(22,163,74,0.4)'}}>
          <Text style={{fontWeight:'800',fontSize:SZ.xs,color:C.green}}>✅ Active Account</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{padding:16,paddingTop:24,paddingBottom:40,gap:10}}>
        {MENU.map(m=>(
          <TouchableOpacity key={m.label} onPress={m.onPress} style={{backgroundColor:C.card,borderRadius:16,padding:16,flexDirection:'row',alignItems:'center',gap:14,...C.sh}}>
            <View style={{width:44,height:44,backgroundColor:C.inp,borderRadius:14,alignItems:'center',justifyContent:'center'}}><Ionicons name={m.icon} size={22} color={C.g4}/></View>
            <Text style={{flex:1,fontWeight:'700',fontSize:SZ.base,color:C.t1}}>{m.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.t4}/>
          </TouchableOpacity>
        ))}

        <TouchableOpacity onPress={async()=>{setLoading(true);await logout();setLoading(false);}} style={{backgroundColor:'rgba(220,38,38,0.08)',borderWidth:1.5,borderColor:'rgba(220,38,38,0.25)',borderRadius:16,padding:16,flexDirection:'row',alignItems:'center',gap:14,marginTop:8}}>
          <View style={{width:44,height:44,backgroundColor:'rgba(220,38,38,0.1)',borderRadius:14,alignItems:'center',justifyContent:'center'}}><Ionicons name="log-out-outline" size={22} color={C.red}/></View>
          <Text style={{flex:1,fontWeight:'700',fontSize:SZ.base,color:C.red}}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SearchScreen({ navigation }){
  const { cart, addToCart } = useApp();
  const [q,setQ]=useState('');
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(false);
  async function search(){
    if(!q.trim())return;
    setLoading(true);
    try{ const r=await API.items('',q); if(r?.offline)setItems(SAMPLE_ITEMS.filter(i=>i.status==='approved'&&i.name.toLowerCase().includes(q.toLowerCase()))); else if(r?.data?.items)setItems(r.data.items); }
    catch(_){}finally{setLoading(false);}
  }
  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}} edges={['top']}>
      <ScreenHeader title="🔍 Search" subtitle="Find what you need"/>
      <View style={{padding:16,paddingBottom:8}}>
        <View style={{flexDirection:'row',gap:10}}>
          <TextInput style={{flex:1,backgroundColor:C.inp,borderRadius:14,borderWidth:2,borderColor:C.bdr,paddingHorizontal:16,height:50,fontSize:SZ.base,color:C.t1}} placeholder="Search items…" placeholderTextColor={C.t4} value={q} onChangeText={setQ} onSubmitEditing={search} returnKeyType="search" autoFocus/>
          <TouchableOpacity style={{width:50,height:50,backgroundColor:C.g3,borderRadius:14,alignItems:'center',justifyContent:'center',...C.shMd}} onPress={search}><Ionicons name="search" size={20} color="#fff"/></TouchableOpacity>
        </View>
      </View>
      {loading?<View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator size="large" color={C.g4}/></View>
        :<FlatList data={items} keyExtractor={i=>String(i.id)} numColumns={2} columnWrapperStyle={{justifyContent:'space-between',paddingHorizontal:16}} contentContainerStyle={{paddingTop:8,paddingBottom:90}}
          renderItem={({item})=><ItemCard item={item} onPress={()=>navigation.navigate('Detail',{item})} onAddCart={()=>addToCart(item)} inCart={!!cart.find(c=>c.id===item.id)}/>}
          ListEmptyComponent={<View style={{alignItems:'center',paddingTop:60}}><Text style={{fontSize:60,marginBottom:12}}>🔍</Text><Text style={{fontWeight:'700',fontSize:SZ.lg,color:C.t1,textAlign:'center'}}>{q?'No results found':'Search for items above'}</Text></View>}
        />
      }
    </SafeAreaView>
  );
}

function MyItemsScreen({ navigation }){
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ API.myItems().then(r=>{ if(r?.data?.items)setItems(r.data.items); }).catch(()=>{}).finally(()=>setLoading(false)); },[]);
  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}} edges={['top']}>
      <ScreenHeader title="My Listings" onBack={()=>navigation.goBack()}/>
      {loading?<View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator size="large" color={C.g4}/></View>
        :<FlatList data={items} keyExtractor={i=>String(i.id)} contentContainerStyle={{padding:16,gap:12}}
          renderItem={({item})=>(
            <View style={{backgroundColor:C.card,borderRadius:16,padding:16,flexDirection:'row',gap:12,...C.sh}}>
              <View style={{width:60,height:60,backgroundColor:C.inp,borderRadius:12,alignItems:'center',justifyContent:'center',overflow:'hidden'}}>{item.image_url?<Image source={{uri:item.image_url}} style={{width:'100%',height:'100%'}}/>:<Text style={{fontSize:28}}>{item.emoji||'🎒'}</Text>}</View>
              <View style={{flex:1}}>
                <Text style={{fontWeight:'700',fontSize:SZ.base,color:C.t1,marginBottom:3}} numberOfLines={1}>{item.name}</Text>
                <Text style={{fontWeight:'800',fontSize:SZ.md,color:C.g2,marginBottom:6}}>KSh {parseFloat(item.price).toLocaleString()}</Text>
                <StatusPill status={item.status} small/>
              </View>
            </View>
          )}
          ListEmptyComponent={<View style={{alignItems:'center',paddingTop:60}}><Text style={{fontSize:60,marginBottom:12}}>📦</Text><Text style={{fontWeight:'700',fontSize:SZ.lg,color:C.t1}}>No listings yet</Text></View>}
        />
      }
    </SafeAreaView>
  );
}

function ReceiptsScreen({ navigation }){
  const { localReceipts } = useApp();
  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}} edges={['top']}>
      <ScreenHeader title="My Receipts" onBack={()=>navigation.goBack()}/>
      <FlatList data={localReceipts} keyExtractor={r=>String(r.id)} contentContainerStyle={{padding:16,gap:12}}
        renderItem={({item:r})=>(
          <View style={{backgroundColor:C.card,borderRadius:16,padding:16,...C.sh}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
              <Text style={{fontWeight:'800',fontSize:SZ.base,color:C.g2}}>#{r.id}</Text>
              <Text style={{fontWeight:'800',fontSize:SZ.lg,color:C.t1}}>KSh {parseFloat(r.total).toLocaleString()}</Text>
            </View>
            <Text style={{fontSize:SZ.xs,color:C.t3}}>{r.date} at {r.time}</Text>
            <Text style={{fontSize:SZ.xs,color:C.t3}}>{r.itemCount} item{r.itemCount!==1?'s':''} · Cash on Delivery</Text>
          </View>
        )}
        ListEmptyComponent={<View style={{alignItems:'center',paddingTop:60}}><Text style={{fontSize:60,marginBottom:12}}>🧾</Text><Text style={{fontWeight:'700',fontSize:SZ.lg,color:C.t1}}>No receipts yet</Text></View>}
      />
    </SafeAreaView>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN SCREENS
═══════════════════════════════════════════════════════════════ */
function AdminDashScreen({ navigation }){
  const { user, logout, localItems, localUsers, localReceipts } = useApp();
  const [stats,setStats]=useState(null);
  const [refreshing,setRefreshing]=useState(false);

  async function loadStats(){
    try{ const r=await API.adDash(); if(r?.data)setStats(r.data); }
    catch(_){}finally{setRefreshing(false);}
  }
  useEffect(()=>{loadStats();},[]);

  const s=stats||{
    items:{total:localItems.length,pending:localItems.filter(i=>i.status==='pending').length,approved:localItems.filter(i=>i.status==='approved').length,sold:localItems.filter(i=>i.status==='sold').length},
    users:{total:localUsers.length,pending:localUsers.filter(u=>u.status==='pending').length,approved:localUsers.filter(u=>u.status==='approved').length},
    receipts:{total:localReceipts.length,revenue:localReceipts.reduce((t,r)=>t+parseFloat(r.total||0),0)},
    messages:{unread:0,total:0},
  };

  const KPI=({icon,val,label,color,action,onAction})=>(
    <View style={{width:(W-52)/2,backgroundColor:C.card,borderRadius:18,padding:16,borderLeftWidth:4,borderLeftColor:color,...C.sh,marginBottom:10}}>
      <Text style={{fontSize:24,marginBottom:6}}>{icon}</Text>
      <Text style={{fontWeight:'800',fontSize:SZ['2xl'],color,lineHeight:28,marginBottom:2}}>{String(val)}</Text>
      <Text style={{fontSize:SZ.xs,color:C.t3,fontWeight:'600'}}>{label}</Text>
      {action&&<TouchableOpacity onPress={onAction} style={{marginTop:10,backgroundColor:color+'22',borderRadius:8,paddingHorizontal:10,paddingVertical:5,alignSelf:'flex-start'}}><Text style={{fontWeight:'700',fontSize:SZ.xs,color}}>{action} →</Text></TouchableOpacity>}
    </View>
  );

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}} edges={['top']}>
      <LinearGradient colors={C.gGreen} style={{paddingHorizontal:20,paddingTop:8,paddingBottom:24}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
          <View>
            <View style={{backgroundColor:C.gold,paddingHorizontal:10,paddingVertical:4,borderRadius:20,alignSelf:'flex-start',marginBottom:8}}><Text style={{fontWeight:'800',fontSize:10,color:'#050a05',letterSpacing:1}}>🛡️ ADMIN</Text></View>
            <Text style={{fontWeight:'800',fontSize:SZ['2xl'],color:'#fff'}}>KabiangaMarket</Text>
            <Text style={{fontSize:SZ.xs,color:'rgba(255,255,255,0.4)',marginTop:2}}>{user?.email}</Text>
          </View>
          <TouchableOpacity onPress={()=>Alert.alert('Logout','Are you sure you want to logout?',[{text:'Cancel'},{text:'Logout',style:'destructive',onPress:logout}])} style={{backgroundColor:'rgba(255,255,255,0.1)',padding:10,borderRadius:12}}>
            <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.7)"/>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);loadStats();}} tintColor={C.g4}/>} contentContainerStyle={{padding:16,paddingBottom:32}}>
        <Text style={{fontWeight:'800',fontSize:SZ.xl,color:C.t1,marginBottom:4}}>📊 Dashboard</Text>
        <Text style={{fontWeight:'800',fontSize:SZ.xs,color:C.t3,textTransform:'uppercase',letterSpacing:2,marginBottom:10,marginTop:12}}>Items</Text>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
          <KPI icon="📦" val={s.items?.total??0} label="Total Items" color={C.g4}/>
          <KPI icon="⏳" val={s.items?.pending??0} label="Pending Review" color={C.gold} action="Review" onAction={()=>navigation.navigate('Items')}/>
          <KPI icon="✅" val={s.items?.approved??0} label="Live & Approved" color={C.green}/>
          <KPI icon="🏷️" val={s.items?.sold??0} label="Sold" color={C.blue}/>
        </View>
        <Text style={{fontWeight:'800',fontSize:SZ.xs,color:C.t3,textTransform:'uppercase',letterSpacing:2,marginBottom:10,marginTop:6}}>Users</Text>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
          <KPI icon="👥" val={s.users?.total??0} label="Total Users" color={C.g4}/>
          <KPI icon="⏳" val={s.users?.pending??0} label="Pending Approval" color={C.gold} action="Approve" onAction={()=>navigation.navigate('Users')}/>
          <KPI icon="✅" val={s.users?.approved??0} label="Approved" color={C.green}/>
        </View>
        <Text style={{fontWeight:'800',fontSize:SZ.xs,color:C.t3,textTransform:'uppercase',letterSpacing:2,marginBottom:10,marginTop:6}}>Revenue</Text>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>
          <KPI icon="🧾" val={s.receipts?.total??0} label="Total Orders" color={C.purple}/>
          <KPI icon="💰" val={`KSh ${(s.receipts?.revenue||0).toLocaleString()}`} label="Revenue" color={C.gold}/>
        </View>

        <Text style={{fontWeight:'800',fontSize:SZ.xs,color:C.t3,textTransform:'uppercase',letterSpacing:2,marginBottom:10,marginTop:14}}>Quick Actions</Text>
        {[
          {label:'Manage Items',icon:'cube-outline',screen:'Items',color:C.g3},
          {label:'Approve Users',icon:'people-outline',screen:'Users',color:C.blue},
          {label:'View Receipts',icon:'receipt-outline',screen:'Receipts',color:C.purple},
          {label:'Contact Messages',icon:'chatbubbles-outline',screen:'Messages',color:C.gold},
          {label:'Site Settings',icon:'settings-outline',screen:'Settings',color:C.t2},
        ].map(a=>(
          <TouchableOpacity key={a.screen} onPress={()=>navigation.navigate(a.screen)} style={{backgroundColor:C.card,borderRadius:16,padding:16,flexDirection:'row',alignItems:'center',gap:14,...C.sh,marginBottom:10}}>
            <View style={{width:44,height:44,backgroundColor:a.color+'22',borderRadius:14,alignItems:'center',justifyContent:'center'}}><Ionicons name={a.icon} size={22} color={a.color}/></View>
            <Text style={{flex:1,fontWeight:'700',fontSize:SZ.base,color:C.t1}}>{a.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.t4}/>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function AdminItemsScreen(){
  const { adminApproveItem, adminRejectItem, adminDeleteItem, localItems } = useApp();
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState('all');
  const [search,setSearch]=useState('');
  const [refreshing,setRefreshing]=useState(false);

  async function load(f=filter,q=search){
    try{
      const r=await API.adItems(f,q);
      if(r?.offline){ setItems(localItems.filter(i=>(f==='all'||i.status===f)&&(!q||i.name.toLowerCase().includes(q.toLowerCase())))); }
      else if(r?.data?.items) setItems(r.data.items);
    }catch(_){ setItems(localItems); }
    finally{ setLoading(false); setRefreshing(false); }
  }
  useEffect(()=>{load();},[filter,localItems]);

  async function doAction(item,action){
    Alert.alert(`${action==='approve'?'Approve':action==='reject'?'Reject':'Delete'} Item`,`${action} "${item.name}"?`,[
      {text:'Cancel'},{text:'Confirm',style:action==='delete'?'destructive':'default',onPress:async()=>{
        try{
          const r=await API.adIAct(item.id,action);
          if(r?.offline||r?.success){
            if(action==='approve')adminApproveItem(item.id);
            else if(action==='reject')adminRejectItem(item.id);
            else adminDeleteItem(item.id);
          }
          load();
        }catch(err){}
      }}
    ]);
  }

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}} edges={['top']}>
      <LinearGradient colors={C.gGreen} style={{paddingHorizontal:20,paddingTop:8,paddingBottom:18}}>
        <Text style={{fontWeight:'800',fontSize:SZ.xl,color:'#fff',marginBottom:12}}>📦 Manage Items</Text>
        <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'rgba(255,255,255,0.1)',borderRadius:12,paddingHorizontal:14,height:42,gap:8}}>
          <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.6)"/>
          <TextInput style={{flex:1,fontSize:SZ.sm,color:'#fff'}} placeholder="Search items…" placeholderTextColor="rgba(255,255,255,0.35)" value={search} onChangeText={q=>{setSearch(q);load(filter,q);}}/>
        </View>
      </LinearGradient>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{backgroundColor:C.surf,maxHeight:48}} contentContainerStyle={{paddingHorizontal:12,paddingVertical:10,gap:8}}>
        {[['all','All'],['pending','⏳ Pending'],['approved','✅ Live'],['sold','🏷️ Sold'],['rejected','❌ Rejected']].map(([k,l])=>(
          <TouchableOpacity key={k} style={{paddingHorizontal:14,paddingVertical:7,borderRadius:50,backgroundColor:filter===k?C.g3:C.inp,borderWidth:1.5,borderColor:filter===k?C.g3:C.bdr,marginRight:6}} onPress={()=>setFilter(k)}>
            <Text style={{fontWeight:'700',fontSize:SZ.xs,color:filter===k?'#fff':C.t2}}>{l}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {loading?<View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator size="large" color={C.g4}/></View>
        :<FlatList data={items} keyExtractor={i=>String(i.id)} contentContainerStyle={{padding:16,gap:12}}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);load();}} tintColor={C.g4}/>}
          renderItem={({item})=>{
            const cat=(item.cat||item.category_name||'other').toLowerCase();
            const bg=CAT_BG[cat]||CAT_BG.other;
            const em=item.emoji||item.category_emoji||CAT_EMOJI[cat]||'🎒';
            return (
              <View style={{backgroundColor:C.card,borderRadius:18,padding:16,...C.sh}}>
                <View style={{flexDirection:'row',marginBottom:12}}>
                  <View style={{width:72,height:72,borderRadius:14,overflow:'hidden',marginRight:12,backgroundColor:C.inp,alignItems:'center',justifyContent:'center'}}>
                    {item.image_url?<Image source={{uri:item.image_url}} style={{width:'100%',height:'100%'}}/>:<LinearGradient colors={bg} style={{width:'100%',height:'100%',alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:28}}>{em}</Text></LinearGradient>}
                  </View>
                  <View style={{flex:1}}>
                    <Text style={{fontWeight:'800',fontSize:SZ.base,color:C.t1,marginBottom:2}} numberOfLines={1}>{item.name}</Text>
                    <Text style={{fontSize:SZ.xs,color:C.t3,marginBottom:3}}>By {item.seller_name||'Unknown'} · {item.location||item.loc||''}</Text>
                    <Text style={{fontWeight:'800',fontSize:SZ.lg,color:C.g2,marginBottom:6}}>KSh {parseFloat(item.price||0).toLocaleString()}</Text>
                    <StatusPill status={item.status} small/>
                  </View>
                </View>
                <View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}>
                  {item.status!=='approved'&&<TouchableOpacity style={{flexDirection:'row',alignItems:'center',gap:5,backgroundColor:C.g3,borderRadius:10,paddingVertical:8,paddingHorizontal:14}} onPress={()=>doAction(item,'approve')}><Ionicons name="checkmark" size={14} color="#fff"/><Text style={{fontWeight:'700',fontSize:SZ.xs,color:'#fff'}}>Approve</Text></TouchableOpacity>}
                  {item.status==='pending'&&<TouchableOpacity style={{flexDirection:'row',alignItems:'center',gap:5,borderWidth:1.5,borderColor:C.red+'44',backgroundColor:C.red+'11',borderRadius:10,paddingVertical:8,paddingHorizontal:14}} onPress={()=>doAction(item,'reject')}><Ionicons name="close" size={14} color={C.red}/><Text style={{fontWeight:'700',fontSize:SZ.xs,color:C.red}}>Reject</Text></TouchableOpacity>}
                  <TouchableOpacity style={{padding:9,borderWidth:1.5,borderColor:C.bdr,borderRadius:10,backgroundColor:C.inp}} onPress={()=>doAction(item,'delete')}><Ionicons name="trash" size={14} color={C.t3}/></TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<View style={{alignItems:'center',paddingTop:60}}><Text style={{fontSize:52,marginBottom:12}}>📦</Text><Text style={{fontWeight:'700',fontSize:SZ.lg,color:C.t1}}>No items found</Text></View>}
        />
      }
    </SafeAreaView>
  );
}

function AdminUsersScreen(){
  const { adminApproveUser, adminRejectUser, adminDeleteUser, localUsers } = useApp();
  const [users,setUsers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState('pending');
  const [search,setSearch]=useState('');
  const [refreshing,setRefreshing]=useState(false);

  async function load(f=filter,q=search){
    try{
      const r=await API.adUsers(f,q);
      if(r?.offline){ setUsers(localUsers.filter(u=>(f==='all'||u.status===f)&&(!q||u.name.toLowerCase().includes(q.toLowerCase())))); }
      else if(r?.data?.users) setUsers(r.data.users);
    }catch(_){ setUsers(localUsers); }
    finally{ setLoading(false); setRefreshing(false); }
  }
  useEffect(()=>{load();},[filter,localUsers]);

  async function doAction(u,action){
    Alert.alert(`${action==='approve'?'Approve':action==='reject'?'Reject':'Delete'} User`,`${action} "${u.name}"?`,[
      {text:'Cancel'},{text:'Confirm',style:action==='delete'?'destructive':'default',onPress:async()=>{
        try{
          await API.adUAct(u.id,action);
          if(action==='approve')adminApproveUser(u.id);
          else if(action==='reject')adminRejectUser(u.id);
          else adminDeleteUser(u.id);
          load();
        }catch(_){}
      }}
    ]);
  }

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}} edges={['top']}>
      <LinearGradient colors={C.gGreen} style={{paddingHorizontal:20,paddingTop:8,paddingBottom:18}}>
        <Text style={{fontWeight:'800',fontSize:SZ.xl,color:'#fff',marginBottom:12}}>👥 Manage Users</Text>
        <View style={{flexDirection:'row',alignItems:'center',backgroundColor:'rgba(255,255,255,0.1)',borderRadius:12,paddingHorizontal:14,height:42,gap:8}}>
          <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.6)"/>
          <TextInput style={{flex:1,fontSize:SZ.sm,color:'#fff'}} placeholder="Search users…" placeholderTextColor="rgba(255,255,255,0.35)" value={search} onChangeText={q=>{setSearch(q);load(filter,q);}}/>
        </View>
      </LinearGradient>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{backgroundColor:C.surf,maxHeight:48}} contentContainerStyle={{paddingHorizontal:12,paddingVertical:10,gap:8}}>
        {[['pending','⏳ Pending'],['approved','✅ Approved'],['rejected','❌ Rejected'],['all','👥 All']].map(([k,l])=>(
          <TouchableOpacity key={k} style={{paddingHorizontal:14,paddingVertical:7,borderRadius:50,backgroundColor:filter===k?C.g3:C.inp,borderWidth:1.5,borderColor:filter===k?C.g3:C.bdr,marginRight:6}} onPress={()=>setFilter(k)}>
            <Text style={{fontWeight:'700',fontSize:SZ.xs,color:filter===k?'#fff':C.t2}}>{l}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {loading?<View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator size="large" color={C.g4}/></View>
        :<FlatList data={users} keyExtractor={u=>String(u.id)} contentContainerStyle={{padding:16,gap:12}}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);load();}} tintColor={C.g4}/>}
          renderItem={({item:u})=>{
            const ini=u.name.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase();
            return (
              <View style={{backgroundColor:C.card,borderRadius:18,padding:16,...C.sh}}>
                <View style={{flexDirection:'row',alignItems:'flex-start',marginBottom:12}}>
                  <LinearGradient colors={C.gGold} style={{width:46,height:46,borderRadius:23,alignItems:'center',justifyContent:'center',marginRight:12,flexShrink:0}}><Text style={{fontWeight:'800',fontSize:SZ.md,color:'#050a05'}}>{ini}</Text></LinearGradient>
                  <View style={{flex:1}}>
                    <View style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap',gap:6,marginBottom:2}}>
                      <Text style={{fontWeight:'800',fontSize:SZ.base,color:C.t1}}>{u.name}</Text>
                      {u.socialProvider&&u.socialProvider!=='email'&&<View style={{backgroundColor:C.g3+'22',borderRadius:8,paddingHorizontal:7,paddingVertical:2}}><Text style={{fontWeight:'700',fontSize:10,color:C.g4}}>via {u.socialProvider||u.social_provider}</Text></View>}
                    </View>
                    <Text style={{fontSize:SZ.xs,color:C.t3,marginBottom:3}}>{u.email}</Text>
                    <Text style={{fontSize:10,color:C.t4,marginBottom:6}}>Registered: {u.registeredAt||u.registered_at||'—'}</Text>
                    <StatusPill status={u.status} small/>
                  </View>
                </View>
                <View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}>
                  {u.status!=='approved'&&<TouchableOpacity style={{flexDirection:'row',alignItems:'center',gap:5,backgroundColor:C.g3,borderRadius:10,paddingVertical:8,paddingHorizontal:14}} onPress={()=>doAction(u,'approve')}><Ionicons name="person-add" size={14} color="#fff"/><Text style={{fontWeight:'700',fontSize:SZ.xs,color:'#fff'}}>Approve</Text></TouchableOpacity>}
                  {u.status!=='rejected'&&<TouchableOpacity style={{flexDirection:'row',alignItems:'center',gap:5,borderWidth:1.5,borderColor:C.red+'44',backgroundColor:C.red+'11',borderRadius:10,paddingVertical:8,paddingHorizontal:14}} onPress={()=>doAction(u,'reject')}><Ionicons name="close" size={14} color={C.red}/><Text style={{fontWeight:'700',fontSize:SZ.xs,color:C.red}}>Reject</Text></TouchableOpacity>}
                  <TouchableOpacity style={{padding:9,borderWidth:1.5,borderColor:C.bdr,borderRadius:10,backgroundColor:C.inp}} onPress={()=>doAction(u,'delete')}><Ionicons name="trash" size={14} color={C.t3}/></TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<View style={{alignItems:'center',paddingTop:60}}><Text style={{fontSize:52,marginBottom:12}}>👥</Text><Text style={{fontWeight:'700',fontSize:SZ.lg,color:C.t1,textAlign:'center'}}>{filter==='pending'?'🎉 No pending registrations!':'No users found'}</Text></View>}
        />
      }
    </SafeAreaView>
  );
}

function AdminReceiptsScreen(){
  const { localReceipts } = useApp();
  const [receipts,setReceipts]=useState([]);
  useEffect(()=>{ API.adRcts().then(r=>{ if(r?.data?.receipts)setReceipts(r.data.receipts); else setReceipts(localReceipts); }).catch(()=>setReceipts(localReceipts)); },[localReceipts]);
  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}} edges={['top']}>
      <ScreenHeader title="🧾 Receipts" subtitle="All orders"/>
      <FlatList data={receipts} keyExtractor={r=>String(r.id||r.receipt_number)} contentContainerStyle={{padding:16,gap:12}}
        renderItem={({item:r})=>(
          <View style={{backgroundColor:C.card,borderRadius:16,padding:16,...C.sh}}>
            <View style={{flexDirection:'row',alignItems:'center',gap:14}}>
              <View style={{width:48,height:48,backgroundColor:C.g3+'33',borderRadius:14,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:22}}>🧾</Text></View>
              <View style={{flex:1}}>
                <Text style={{fontWeight:'800',fontSize:SZ.base,color:C.g2}}>#{r.id||r.receipt_number}</Text>
                <Text style={{fontSize:SZ.xs,color:C.t3}}>{r.buyer_name||r.buyer} · {r.buyer_email||r.buyerEmail}</Text>
                <Text style={{fontSize:10,color:C.t4}}>{r.created_at?.slice(0,10)||r.date}</Text>
              </View>
              <Text style={{fontWeight:'800',fontSize:SZ.lg,color:C.t1}}>KSh {parseFloat(r.total_amount||r.total||0).toLocaleString()}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={{alignItems:'center',paddingTop:60}}><Text style={{fontSize:52,marginBottom:12}}>🧾</Text><Text style={{fontWeight:'700',fontSize:SZ.lg,color:C.t1}}>No receipts yet</Text></View>}
      />
    </SafeAreaView>
  );
}

function AdminMessagesScreen(){
  const [msgs,setMsgs]=useState([]);
  useEffect(()=>{ API.adMsgs().then(r=>{ if(r?.data?.messages)setMsgs(r.data.messages); }).catch(()=>{}); },[]);
  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}} edges={['top']}>
      <ScreenHeader title="💬 Messages" subtitle={`${msgs.filter(m=>!m.is_read).length} unread`}/>
      <FlatList data={msgs} keyExtractor={m=>String(m.id)} contentContainerStyle={{padding:16,gap:12}}
        renderItem={({item:m})=>(
          <View style={{backgroundColor:C.card,borderRadius:16,padding:16,...C.sh,borderLeftWidth:3,borderLeftColor:m.is_read?C.bdr:C.gold}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:6}}>
              <Text style={{fontWeight:'800',fontSize:SZ.base,color:C.t1}}>{m.name}</Text>
              <Text style={{fontSize:10,color:C.t4}}>{m.created_at?.slice(0,10)}</Text>
            </View>
            <Text style={{fontSize:SZ.xs,color:C.t3,marginBottom:8}}>{m.email}</Text>
            <Text style={{fontSize:SZ.sm,color:C.t2,lineHeight:20}}>{m.message}</Text>
          </View>
        )}
        ListEmptyComponent={<View style={{alignItems:'center',paddingTop:60}}><Text style={{fontSize:52,marginBottom:12}}>💬</Text><Text style={{fontWeight:'700',fontSize:SZ.lg,color:C.t1}}>No messages yet</Text></View>}
      />
    </SafeAreaView>
  );
}

function AdminSettingsScreen(){
  const { showToast } = useApp();
  const [settings,setSettings]=useState({marketplace_name:'KabiangaMarket',marketplace_tagline:'University of Kabianga',whatsapp_number:WHATSAPP_NUM,call_number:CALL_NUM,admin_contact_email:ADMIN_EMAIL});
  const [loading,setLoading]=useState(false);
  const set=k=>v=>setSettings(s=>({...s,[k]:v}));

  useEffect(()=>{ API.settings().then(r=>{ if(r?.data)setSettings(s=>({...s,...r.data})); }).catch(()=>{}); },[]);

  async function save(){
    setLoading(true);
    try{ await API.adSave(settings); showToast('Settings saved! ✅','success'); }
    catch(_){ showToast('Saved locally (offline mode)','info'); }
    finally{ setLoading(false); }
  }

  return (
    <SafeAreaView style={{flex:1,backgroundColor:C.bg}} edges={['top']}>
      <ScreenHeader title="⚙️ Settings" subtitle="Configure marketplace"/>
      <ScrollView contentContainerStyle={{padding:16,gap:0,paddingBottom:40}} keyboardShouldPersistTaps="handled">
        <View style={{backgroundColor:C.card,borderRadius:20,padding:20,...C.sh,marginBottom:14}}>
          <Text style={{fontWeight:'800',fontSize:SZ.md,color:C.t1,marginBottom:14}}>🏪 Marketplace</Text>
          <Field label="Marketplace Name" value={settings.marketplace_name||''} onChangeText={set('marketplace_name')} placeholder="KabiangaMarket"/>
          <Field label="Tagline" value={settings.marketplace_tagline||''} onChangeText={set('marketplace_tagline')} placeholder="University of Kabianga"/>
        </View>
        <View style={{backgroundColor:C.card,borderRadius:20,padding:20,...C.sh,marginBottom:14}}>
          <Text style={{fontWeight:'800',fontSize:SZ.md,color:C.t1,marginBottom:14}}>📞 Contact Numbers</Text>
          <Field label="WhatsApp Number" value={settings.whatsapp_number||''} onChangeText={set('whatsapp_number')} placeholder="+254 712 345 678" type="phone"/>
          <Field label="Call Number" value={settings.call_number||''} onChangeText={set('call_number')} placeholder="+254 712 345 678" type="phone"/>
          <Field label="Admin Email" value={settings.admin_contact_email||''} onChangeText={set('admin_contact_email')} placeholder="admin@kabianga.ac.ke" type="email"/>
          <View style={{flexDirection:'row',gap:10,marginTop:4}}>
            <TouchableOpacity style={{flex:1,height:46,backgroundColor:'#25D366',borderRadius:14,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8}} onPress={()=>Linking.openURL(`https://wa.me/${(settings.whatsapp_number||WHATSAPP_NUM).replace(/\D/g,'')}`)}>
              <Ionicons name="logo-whatsapp" size={16} color="#fff"/><Text style={{fontWeight:'700',color:'#fff',fontSize:SZ.sm}}>Test WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flex:1,height:46,backgroundColor:C.g3,borderRadius:14,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8}} onPress={()=>Linking.openURL(`tel:${(settings.call_number||CALL_NUM).replace(/\D/g,'')}`)}>
              <Ionicons name="call-outline" size={16} color="#fff"/><Text style={{fontWeight:'700',color:'#fff',fontSize:SZ.sm}}>Test Call</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Btn label={loading?'Saving…':'Save All Settings'} icon="save-outline" onPress={save} disabled={loading}/>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION — Custom Tab Bar
═══════════════════════════════════════════════════════════════ */
function UserTabBar({ state, navigation }){
  const { cartCount } = useApp();
  const tabs=[{name:'Home',icon:'home',screen:'Home'},{name:'Search',icon:'search',screen:'Search'},{name:'Sell',icon:'add-circle',screen:'Post'},{name:'Cart',icon:'cart',screen:'Cart'},{name:'Profile',icon:'person',screen:'Profile'}];
  return (
    <View style={{flexDirection:'row',backgroundColor:C.nav,height:72,paddingBottom:10,paddingTop:8,borderTopWidth:1,borderTopColor:'rgba(212,147,10,0.15)',shadowColor:'#000',shadowOffset:{width:0,height:-4},shadowOpacity:0.15,shadowRadius:12,elevation:20}}>
      {state.routes.map((route,i)=>{
        const t=tabs[i]; const focused=state.index===i;
        return (
          <TouchableOpacity key={route.key} style={{flex:1,alignItems:'center',justifyContent:'center'}} onPress={()=>navigation.navigate(route.name)} activeOpacity={0.7}>
            <View style={{width:44,height:32,alignItems:'center',justifyContent:'center',borderRadius:10,marginBottom:2,backgroundColor:focused?'rgba(212,147,10,0.12)':undefined,position:'relative'}}>
              <Ionicons name={focused?t.icon:t.icon+'-outline'} size={t.screen==='Post'?28:22} color={focused?C.gold2:C.t4}/>
              {t.screen==='Cart'&&cartCount>0&&<View style={{position:'absolute',top:-2,right:-4,backgroundColor:C.red,borderRadius:8,minWidth:16,height:16,alignItems:'center',justifyContent:'center',paddingHorizontal:3}}><Text style={{color:'#fff',fontSize:9,fontWeight:'800'}}>{cartCount>9?'9+':cartCount}</Text></View>}
            </View>
            <Text style={{fontSize:10,fontWeight:'700',color:focused?C.gold2:C.t4}}>{t.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function UserTabs(){
  return (
    <Tab.Navigator tabBar={props=><UserTabBar {...props}/>} screenOptions={{headerShown:false}}>
      <Tab.Screen name="Home"    component={HomeScreen}/>
      <Tab.Screen name="Search"  component={SearchScreen}/>
      <Tab.Screen name="Post"    component={PostItemScreen}/>
      <Tab.Screen name="Cart"    component={CartScreen}/>
      <Tab.Screen name="Profile" component={ProfileScreen}/>
    </Tab.Navigator>
  );
}

function AdminTabs(){
  return (
    <Tab.Navigator
      screenOptions={({route})=>({
        headerShown:false,
        tabBarStyle:{backgroundColor:C.nav,borderTopColor:'rgba(212,147,10,0.15)',height:60},
        tabBarActiveTintColor:C.gold2, tabBarInactiveTintColor:C.t4,
        tabBarLabelStyle:{fontSize:10,fontWeight:'700',marginBottom:4},
        tabBarIcon:({focused,color})=>{
          const ic={Dashboard:'analytics',Items:'cube',Users:'people',Receipts:'receipt',Messages:'chatbubbles',Settings:'settings'}[route.name];
          return <Ionicons name={focused?ic:ic+'-outline'} size={20} color={color}/>;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashScreen}/>
      <Tab.Screen name="Items"     component={AdminItemsScreen}/>
      <Tab.Screen name="Users"     component={AdminUsersScreen}/>
      <Tab.Screen name="Receipts"  component={AdminReceiptsScreen}/>
      <Tab.Screen name="Messages"  component={AdminMessagesScreen}/>
      <Tab.Screen name="Settings"  component={AdminSettingsScreen}/>
    </Tab.Navigator>
  );
}

function RootNavigator(){
  const { user, isAdmin } = useApp();
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
      {!user ? (
        <>
          <Stack.Screen name="Landing"  component={LandingScreen}/>
          <Stack.Screen name="Login"    component={LoginScreen} options={{animation:'slide_from_right'}}/>
          <Stack.Screen name="Register" component={RegisterScreen} options={{animation:'slide_from_right'}}/>
          <Stack.Screen name="Forgot"   component={ForgotScreen} options={{animation:'slide_from_bottom'}}/>
        </>
      ) : isAdmin ? (
        <Stack.Screen name="AdminTabs" component={AdminTabs}/>
      ) : (
        <>
          <Stack.Screen name="UserTabs" component={UserTabs}/>
          <Stack.Screen name="Detail"   component={DetailScreen} options={{animation:'slide_from_right'}}/>
          <Stack.Screen name="MyItems"  component={MyItemsScreen} options={{animation:'slide_from_right'}}/>
          <Stack.Screen name="Receipts" component={ReceiptsScreen} options={{animation:'slide_from_right'}}/>
        </>
      )}
    </Stack.Navigator>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════ */
export default function App(){
  return (
    <GestureHandlerRootView style={{flex:1}}>
      <SafeAreaProvider>
        <AppProvider>
          <NavigationContainer>
            <ExpoStatusBar style="light"/>
            <RootNavigator/>
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
