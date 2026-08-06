import{$t as e,Cn as t,D as n,Hn as r,J as i,K as a,P as o,R as s,T as c,Tn as l,Ut as u,Y as d,Yt as f,Zt as p,kt as m,nt as h,q as g,sr as _,tt as v,ur as y}from"./charts-D3TmX40N.js";import{s as b}from"./graphql-REqfkFwC.js";import{o as x,t as S}from"./VList-Ch3BnNND.js";import{t as C}from"./VIcon-CaEd7GYo.js";import{$ as w,An as T,Bn as E,Bt as D,En as O,Fn as k,H as A,Ht as j,Nn as M,Pn as N,Rt as P,U as F,Ut as ee,Wn as te,Zn as I,_n as L,b as R,et as z,jt as B,m as V,nt as H,o as U,r as W,rt as G,s as K,t as q,xn as J}from"./index-Bc_wvyDW.js";import{t as Y}from"./VDivider-CazlnPOF.js";import{t as X}from"./EditBulkDialog-BjUGaqC4.js";import{t as Z}from"./VCheckboxBtn-aqWDE74Y.js";import{t as Q}from"./VTextField-e6ExJIa4.js";import{t as ne}from"./ListSort-CeJwQvO9.js";import{a as re,r as ie}from"./files-7XFRiCq6.js";import{t as ae}from"./VPagination-DYW_uFqs.js";import{t as oe}from"./SchemaItems-D02aLMQe.js";var se=b`
  mutation ($input: ElementInput!) {
    addElement(input: $input) {
      id
      lang
      name
      type
      data
      editor
      created_at
      updated_at
      deleted_at
    }
  }
`,ce=b`
  mutation ($id: [ID!]!) {
    dropElement(id: $id) {
      id
    }
  }
`,le=b`
  mutation ($id: [ID!]!) {
    keepElement(id: $id) {
      id
    }
  }
`,ue=b`
  mutation ($id: [ID!]!) {
    pubElement(id: $id) {
      id
    }
  }
`,de=b`
  mutation ($id: [ID!]!) {
    purgeElement(id: $id) {
      id
    }
  }
`,fe=b`
  mutation ($id: [ID!]!, $input: ElementInput!) {
    bulkElement(id: $id, input: $input) {
      ids
    }
  }
`,pe=b`
  ${ie}
  query (
    $filter: ElementFilter
    $sort: [QueryElementsSortOrderByClause!]
    $limit: Int!
    $page: Int!
    $trashed: Trashed
    $publish: Publish
  ) {
    elements(
      filter: $filter
      sort: $sort
      first: $limit
      page: $page
      trashed: $trashed
      publish: $publish
    ) {
      data {
        id
        lang
        name
        type
        data
        editor
        created_at
        updated_at
        deleted_at
        files {
          ...CmsFileFields
        }
        latest {
          id
          published
          publish_at
          data
          editor
          created_at
          files {
            ...CmsFileFields
          }
        }
      }
      paginatorInfo {
        lastPage
      }
    }
  }
`,me=Object.freeze([{column:`ID`,order:`DESC`,label:`Latest`},{column:`ID`,order:`ASC`,label:`Oldest`},{column:`LATEST_ID`,order:`DESC`,label:`Latest edit`},{column:`LATEST_ID`,order:`ASC`,label:`Oldest edit`},{column:`NAME`,order:`ASC`,label:`Name`},{column:`TYPE`,order:`ASC`,label:`Type`},{column:`EDITOR`,order:`ASC`,label:`Editor`}]),he={components:{SchemaItems:oe,EditBulkDialog:X,ListSort:ne},props:{embed:{type:Boolean,default:!1},filter:{type:Object,default:()=>({})}},emits:[`select`],data(){return{items:[],menu:[],checked:new Set,term:``,sort:this.user.getData(`element`,`sort`)||{column:`ID`,order:`DESC`},page:1,last:1,limit:100,vschemas:!1,actions:!1,editDialog:!1,editIds:[],editSelected:!1,loading:!0,trash:!1,destroyed:!1,echoCleanup:null,echoPromise:null,outdated:!1}},setup(){let e=O();return{user:T(),changes:J(),messages:e,mdiDotsVertical:G,mdiClose:F,mdiPublish:j,mdiDelete:w,mdiDeleteRestore:H,mdiDeleteForever:z,mdiPlus:D,mdiMagnify:B,mdiClockOutline:A,mdiRefresh:ee,mdiPencil:P,sortOptions:me,debounce:E}},created(){this.search(),this.searchd=this.debounce(this.search,500),this.embed||k(this,`element`,(e,t)=>N(this,e,t))},beforeUnmount(){this.destroyed=!0,M(this),this.items=null,this.menu=null,this.checked=null},activated(){this.sync()},computed:{canTrash(){return this.items.some(e=>this.checked.has(e.id)&&!e.deleted_at)},isChecked(){return this.checked.size>0},isTrashed(){return this.items.some(e=>this.checked.has(e.id)&&e.deleted_at)}},methods:{add(e){if(this.embed||!this.user.can(`element:add`)){this.messages.add(this.$gettext(`Permission denied`),`error`);return}return this.$apollo.mutate({mutation:se,variables:{input:{type:e.type,name:``,data:`{}`}}}).then(e=>{if(e.errors)throw e.errors;let t=e.data?.addElement||{};return t.data=te(t.data),t.published=!0,this.vschemas=!1,this.items.unshift(t),this.$emit(`select`,t),this.invalidate(),t}).catch(e=>{this.$log(`ElementListItems::add(): Error adding shared element`,e)})},drop(e){if(!this.user.can(`element:drop`)){this.messages.add(this.$gettext(`Permission denied`),`error`);return}let t=e?[e]:this.items.filter(e=>this.checked.has(e.id));t.length&&this.$apollo.mutate({mutation:ce,variables:{id:t.map(e=>e.id)}}).then(e=>{if(e.errors)throw e.errors;this.invalidate(),this.search()}).catch(e=>{this.messages.add(this.$gettext(`Error trashing shared element`)+`:
`+e,`error`),this.$log(`ElementListItems::drop(): Error trashing shared element`,t,e)})},reload(){this.outdated=!1,this.items=[],this.loading=!0,this.invalidate(),this.search()},patch(e){let t=this.items?.find(t=>t.id===e.id);if(!t)return!1;for(let n in e)n in t&&(t[n]=e[n]);return!0},patchItems(e){let t=new Map(e.map(e=>[e.id,e]));this.items?.forEach(e=>{let n=t.get(e.id);if(n)for(let t in n)t in e&&(e[t]=n[t])})},sync(){let e=this.changes.get(`element`).filter(e=>this.patch(e)).map(e=>e.id);this.changes.patched(`element`,e)},invalidate(){let e=this.$apollo.provider.defaultClient.cache;e.evict({id:`ROOT_QUERY`,fieldName:`elements`}),e.gc()},keep(e){if(!this.user.can(`element:keep`)){this.messages.add(this.$gettext(`Permission denied`),`error`);return}let t=e?[e]:this.items.filter(e=>this.checked.has(e.id));t.length&&this.$apollo.mutate({mutation:le,variables:{id:t.map(e=>e.id)}}).then(e=>{if(e.errors)throw e.errors;this.invalidate(),this.search()}).catch(e=>{this.messages.add(this.$gettext(`Error restoring shared element`)+`:
`+e,`error`),this.$log(`ElementListItems::keep(): Error restoring shared element`,t,e)})},publish(e){if(!this.user.can(`element:publish`)){this.messages.add(this.$gettext(`Permission denied`),`error`);return}let t=e?[e]:this.items.filter(e=>this.checked.has(e.id)&&e.id&&!e.published);t.length&&this.$apollo.mutate({mutation:ue,variables:{id:t.map(e=>e.id)}}).then(e=>{if(e.errors)throw e.errors;this.invalidate(),this.search()}).catch(e=>{this.messages.add(this.$gettext(`Error publishing shared element`)+`:
`+e,`error`),this.$log(`ElementListItems::publish(): Error publishing shared element`,t,e)})},purge(e){if(!this.user.can(`element:purge`)){this.messages.add(this.$gettext(`Permission denied`),`error`);return}let t=e?[e]:this.items.filter(e=>this.checked.has(e.id));t.length&&this.$apollo.mutate({mutation:de,variables:{id:t.map(e=>e.id)}}).then(e=>{if(e.errors)throw e.errors;this.invalidate(),this.search()}).catch(e=>{this.messages.add(this.$gettext(`Error purging shared element`)+`:
`+e,`error`),this.$log(`ElementListItems::purge(): Error purging shared element`,t,e)})},edit(e=null){this.editIds=e?[e.id]:[...this.checked],this.editSelected=!e,this.actions=!1,this.editDialog=this.editIds.length>0},save(e){if(!this.user.can(`element:save`)){this.messages.add(this.$gettext(`Permission denied`),`error`);return}let t=this.editIds,n=this.editSelected?null:new Set(this.checked);if(!(!t.length||e===null))return this.$apollo.mutate({mutation:fe,variables:{id:t,input:{lang:e}}}).then(e=>{if(e.errors)throw e.errors;return this.editIds=[],this.editSelected&&(this.checked=new Set),this.editSelected=!1,this.invalidate(),this.search().then(()=>{n&&(this.checked=n)})}).catch(n=>{this.messages.add(this.$gettext(`Error saving shared element`)+`:
`+n,`error`),this.$log(`ElementListItems::save(): Error saving shared elements`,t,e,n)})},search(){if(!this.user.can(`element:view`))return this.messages.add(this.$gettext(`Permission denied`),`error`),Promise.resolve([]);let e=this.filter.publish||null,t=this.filter.trashed||`WITHOUT`,n={...this.filter};delete n.publish,delete n.trashed;for(let e in n)n[e]===null&&delete n[e];return this.term&&(n.any=this.term),this.loading=!0,this.$apollo.query({query:pe,fetchPolicy:`no-cache`,variables:{filter:n,page:this.page,limit:this.limit,sort:[this.sort],trashed:t,publish:e}}).then(e=>{if(e.errors)throw e.errors;let t=e.data.elements||{};return this.last=t.paginatorInfo?.lastPage||1,this.items=[...t.data||[]].map(e=>{let t=e.latest,n=t?.data?I(t.data):{...e,data:I(e.data)};return n.data&&typeof n.data==`object`&&(n.data=r(n.data)),Object.assign(n,{id:e.id,deleted_at:e.deleted_at,created_at:e.created_at,updated_at:e.latest?.created_at||e.updated_at,editor:e.latest?.editor||e.editor,published:e.latest?.published??!0,publish_at:e.latest?.publish_at||null,latest_id:e.latest?.id||null,files:Object.freeze((t?.files||e.files||[]).map(re))})}),this.checked=new Set,this.loading=!1,this.items}).catch(e=>{this.messages.add(this.$gettext(`Error fetching shared elements`)+`:
`+e,`error`),this.$log(`ElementListItems::search(): Error fetching shared element`,e)})},title(e){let t=[];return e.publish_at&&t.push(`Publish at: `+new Date(e.publish_at).toLocaleDateString()),t.join(`
`)},toggle(){this.checked.size>0?this.checked=new Set:this.checked=new Set(this.items.map(e=>e.id))},toggleCheck(e){let t=new Set(this.checked);t.has(e.id)?t.delete(e.id):t.add(e.id),this.checked=t}},watch:{"changes.changed.element"(){this.sync()},filter:{deep:!0,handler(){this.search()}},term(){this.searchd()},page(){this.search()},sort:{deep:!0,handler(){this.user.saveData(`element`,`sort`,this.sort),this.search()}}}},ge={class:`header`},_e={class:`bulk`},ve={class:`btn-actions`},ye={class:`search`},be={class:`layout`},xe={class:`actions`},Se={class:`btn-actions`},Ce=[`onClick`,`title`],we={class:`item-text`},Te={class:`item-head`},Ee={key:0,class:`item-lang`},De={class:`item-title`},$={class:`item-type item-subtitle`},Oe={class:`item-aux`},ke={class:`item-editor`},Ae={class:`item-modified item-subtitle`},je={key:0,class:`loading`},Me={key:1,class:`notfound`},Ne={key:3,class:`btn-group`};function Pe(r,b,w,T,E,D){let O=p(`ListSort`),k=p(`SchemaItems`),A=p(`EditBulkDialog`);return u(),d(o,null,[a(`div`,ge,[a(`div`,_e,[h(Z,{"model-value":E.checked.size>0,onClick:b[0]||=n(e=>D.toggle(),[`stop`]),"aria-label":r.$gettext(`Toggle selection`)},null,8,[`model-value`,`aria-label`]),a(`span`,ve,[(u(),g(e(r.$vuetify.display.xs?`v-dialog`:`v-menu`),{"aria-label":r.$gettext(`Actions`),modelValue:E.actions,"onUpdate:modelValue":b[8]||=e=>E.actions=e,transition:`scale-transition`,location:`end center`,"max-width":`300`},{activator:t(({props:e})=>[h(V,m(e,{disabled:!D.isChecked||w.embed||!T.user.can(`element:add`),title:r.$gettext(`Actions`),icon:T.mdiDotsVertical,variant:`text`}),null,16,[`disabled`,`title`,`icon`])]),default:t(()=>[h(U,null,{default:t(()=>[h(q,{density:`compact`},{default:t(()=>[h(W,null,{default:t(()=>[v(y(r.$gettext(`Actions`)),1)]),_:1}),h(V,{icon:T.mdiClose,"aria-label":r.$gettext(`Close`),onClick:b[1]||=e=>E.actions=!1},null,8,[`icon`,`aria-label`])]),_:1}),h(S,{onClick:b[7]||=e=>E.actions=!1},{default:t(()=>[l(h(x,null,{default:t(()=>[h(V,{"prepend-icon":T.mdiPublish,variant:`text`,onClick:b[2]||=e=>D.publish()},{default:t(()=>[v(y(r.$gettext(`Publish`)),1)]),_:1},8,[`prepend-icon`])]),_:1},512),[[c,D.isChecked&&T.user.can(`element:publish`)]]),l(h(x,null,{default:t(()=>[h(V,{"prepend-icon":T.mdiPencil,variant:`text`,onClick:b[3]||=e=>D.edit()},{default:t(()=>[v(y(r.$gettext(`Edit properties`)),1)]),_:1},8,[`prepend-icon`])]),_:1},512),[[c,D.isChecked&&T.user.can(`element:save`)]]),l(h(x,null,{default:t(()=>[h(V,{"prepend-icon":T.mdiDelete,variant:`text`,onClick:b[4]||=e=>D.drop()},{default:t(()=>[v(y(r.$gettext(`Delete`)),1)]),_:1},8,[`prepend-icon`])]),_:1},512),[[c,D.canTrash&&T.user.can(`element:drop`)]]),l(h(x,null,{default:t(()=>[h(V,{"prepend-icon":T.mdiDeleteRestore,variant:`text`,onClick:b[5]||=e=>D.keep()},{default:t(()=>[v(y(r.$gettext(`Restore`)),1)]),_:1},8,[`prepend-icon`])]),_:1},512),[[c,D.isTrashed&&T.user.can(`element:keep`)]]),l(h(x,null,{default:t(()=>[h(V,{"prepend-icon":T.mdiDeleteForever,variant:`text`,onClick:b[6]||=e=>D.purge()},{default:t(()=>[v(y(r.$gettext(`Purge`)),1)]),_:1},8,[`prepend-icon`])]),_:1},512),[[c,D.isChecked&&T.user.can(`element:purge`)]])]),_:1})]),_:1})]),_:1},8,[`aria-label`,`modelValue`]))]),!this.embed&&this.user.can(`element:add`)?(u(),g(V,{key:0,onClick:b[9]||=e=>E.vschemas=!0,title:r.$gettext(`Add element`),disabled:E.loading,icon:T.mdiPlus,class:`btn-add`,color:`primary`,variant:`tonal`},null,8,[`title`,`disabled`,`icon`])):i(``,!0)]),a(`div`,ye,[h(Q,{modelValue:E.term,"onUpdate:modelValue":b[10]||=e=>E.term=e,"prepend-inner-icon":T.mdiMagnify,variant:`underlined`,label:r.$gettext(`Search for`),"hide-details":``,clearable:``},null,8,[`modelValue`,`prepend-inner-icon`,`label`])]),a(`div`,be,[E.outdated?(u(),g(V,{key:0,onClick:b[11]||=e=>D.reload(),"prepend-icon":T.mdiRefresh,title:r.$gettext(`Updated by another user`),color:`primary`,variant:`tonal`,size:`small`,rounded:`lg`,class:`btn-outdated`},{default:t(()=>[v(y(r.$gettext(`Refresh`)),1)]),_:1},8,[`prepend-icon`,`title`])):i(``,!0),h(V,{onClick:b[12]||=e=>D.reload(),title:r.$gettext(`Reload elements`),icon:T.mdiRefresh,class:`btn-reload`,variant:`text`},null,8,[`title`,`icon`]),h(O,{modelValue:E.sort,"onUpdate:modelValue":b[13]||=e=>E.sort=e,options:T.sortOptions},null,8,[`modelValue`,`options`])])]),h(S,{class:`items`},{default:t(()=>[(u(!0),d(o,null,f(E.items,(o,s)=>(u(),g(x,{key:s},{default:t(()=>[a(`div`,xe,[h(Z,{"model-value":E.checked.has(o.id),"onUpdate:modelValue":e=>D.toggleCheck(o),class:_([{draft:!o.published},`item-check`])},null,8,[`model-value`,`onUpdate:modelValue`,`class`]),a(`span`,Se,[(u(),g(e(r.$vuetify.display.xs?`v-dialog`:`v-menu`),{"aria-label":r.$gettext(`Actions`),modelValue:E.menu[s],"onUpdate:modelValue":e=>E.menu[s]=e,transition:`scale-transition`,location:`end center`,"max-width":`300`},{activator:t(({props:e})=>[h(V,m({ref_for:!0},e,{title:r.$gettext(`Actions`),icon:T.mdiDotsVertical,variant:`text`}),null,16,[`title`,`icon`])]),default:t(()=>[h(U,null,{default:t(()=>[h(q,{density:`compact`},{default:t(()=>[h(W,null,{default:t(()=>[v(y(r.$gettext(`Actions`)),1)]),_:1}),h(V,{icon:T.mdiClose,"aria-label":r.$gettext(`Close`),onClick:e=>E.menu[s]=!1},null,8,[`icon`,`aria-label`,`onClick`])]),_:2},1024),h(S,{onClick:e=>E.menu[s]=!1},{default:t(()=>[l(h(x,null,{default:t(()=>[h(V,{"prepend-icon":T.mdiPublish,variant:`text`,onClick:e=>D.publish(o)},{default:t(()=>[v(y(r.$gettext(`Publish`)),1)]),_:1},8,[`prepend-icon`,`onClick`])]),_:2},1536),[[c,!o.deleted_at&&!o.published&&this.user.can(`element:publish`)]]),!o.deleted_at&&!o.published&&T.user.can(`element:publish`)&&T.user.can(`element:save`)?(u(),g(Y,{key:0})):i(``,!0),T.user.can(`element:save`)?(u(),g(x,{key:1},{default:t(()=>[h(V,{"prepend-icon":T.mdiPencil,variant:`text`,onClick:e=>D.edit(o)},{default:t(()=>[v(y(r.$gettext(`Edit properties`)),1)]),_:1},8,[`prepend-icon`,`onClick`])]),_:2},1024)):i(``,!0),T.user.can(`element:save`)?(u(),g(Y,{key:2})):i(``,!0),!o.deleted_at&&this.user.can(`element:drop`)?(u(),g(x,{key:3},{default:t(()=>[h(V,{"prepend-icon":T.mdiDelete,variant:`text`,onClick:e=>D.drop(o)},{default:t(()=>[v(y(r.$gettext(`Delete`)),1)]),_:1},8,[`prepend-icon`,`onClick`])]),_:2},1024)):i(``,!0),o.deleted_at&&this.user.can(`element:keep`)?(u(),g(x,{key:4},{default:t(()=>[h(V,{"prepend-icon":T.mdiDeleteRestore,variant:`text`,onClick:e=>D.keep(o)},{default:t(()=>[v(y(r.$gettext(`Restore`)),1)]),_:1},8,[`prepend-icon`,`onClick`])]),_:2},1024)):i(``,!0),this.user.can(`element:purge`)?(u(),g(x,{key:5},{default:t(()=>[h(V,{"prepend-icon":T.mdiDeleteForever,variant:`text`,onClick:e=>D.purge(o)},{default:t(()=>[v(y(r.$gettext(`Purge`)),1)]),_:1},8,[`prepend-icon`,`onClick`])]),_:2},1024)):i(``,!0)]),_:2},1032,[`onClick`])]),_:2},1024)]),_:2},1032,[`aria-label`,`modelValue`,`onUpdate:modelValue`]))])]),a(`a`,{href:`#`,class:_([`item-content`,{trashed:o.deleted_at}]),onClick:n(e=>r.$emit(`select`,o),[`prevent`]),title:D.title(o)},[a(`div`,we,[a(`div`,Te,[o.lang?(u(),d(`span`,Ee,y(o.lang),1)):i(``,!0),o.publish_at?(u(),g(C,{key:1,class:`publish-at`,icon:T.mdiClockOutline},null,8,[`icon`])):i(``,!0),a(`span`,De,y(o.name||r.$gettext(`New`)),1)]),a(`div`,$,y(o.type),1)]),a(`div`,Oe,[a(`div`,ke,y(o.editor),1),a(`div`,Ae,y(new Date(o.updated_at).toLocaleString()),1)])],10,Ce)]),_:2},1024))),128))]),_:1}),E.loading?(u(),d(`p`,je,[v(y(r.$gettext(`Loading`))+` `,1),b[20]||=a(`svg`,{class:`spinner`,width:`32`,height:`32`,fill:`currentColor`,viewBox:`0 0 24 24`,xmlns:`http://www.w3.org/2000/svg`},[a(`circle`,{class:`spin1`,cx:`4`,cy:`12`,r:`3`}),a(`circle`,{class:`spin1 spin2`,cx:`12`,cy:`12`,r:`3`}),a(`circle`,{class:`spin1 spin3`,cx:`20`,cy:`12`,r:`3`})],-1)])):i(``,!0),!E.loading&&!E.items.length?(u(),d(`p`,Me,y(r.$gettext(`No entries found`)),1)):i(``,!0),E.last>1?(u(),g(ae,{key:2,modelValue:E.page,"onUpdate:modelValue":b[14]||=e=>E.page=e,length:E.last},null,8,[`modelValue`,`length`])):i(``,!0),!this.embed&&this.user.can(`element:add`)?(u(),d(`div`,Ne,[h(V,{onClick:b[15]||=e=>E.vschemas=!0,title:r.$gettext(`Add element`),disabled:E.loading,icon:T.mdiPlus,class:`btn-add`,color:`primary`,variant:`tonal`},null,8,[`title`,`disabled`,`icon`])])):i(``,!0),(u(),g(s,{to:`body`},[h(L,{modelValue:E.vschemas,"onUpdate:modelValue":b[17]||=e=>E.vschemas=e,onAfterLeave:b[18]||=e=>E.vschemas=!1,scrollable:``,width:`auto`},{default:t(()=>[h(U,null,{default:t(()=>[h(K,null,{default:t(()=>[h(k,{type:`content`,onAdd:b[16]||=e=>D.add(e)})]),_:1})]),_:1})]),_:1},8,[`modelValue`])])),h(A,{modelValue:E.editDialog,"onUpdate:modelValue":b[19]||=e=>E.editDialog=e,count:E.editIds.length,onApply:D.save},null,8,[`modelValue`,`count`,`onApply`])],64)}var Fe=R(he,[[`render`,Pe],[`__scopeId`,`data-v-9cf96fb7`]]);export{Fe as t};