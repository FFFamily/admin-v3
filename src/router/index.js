import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layouts/index.vue'

export const constantRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    hidden: true,
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        // Sidebar rendering helper:
        // `filterRoutesForSidebar()` clones routes and always assigns `children: []`,
        // which would make the sidebar treat this leaf node as having children.
        // Mark it as "no showing children" so it renders as a single menu item.
        noShowingChildren: true,
        meta: { title: '首页', icon: 'dashboard' }
      }
    ]
  },
  {
    path: '/admin',
    component: Layout,
    redirect: '/admin/user',
    meta: { title: '后台管理', icon: 'user' },
    children: [
      {
        path: 'user',
        name: 'AdminUser',
        component: () => import('@/views/admin/user/index.vue'),
        meta: { title: '后台用户' }
      },
      {
        path: 'user/:id',
        name: 'AdminUserDetail',
        component: () => import('@/views/admin/user/detail.vue'),
        hidden: true,
        meta: { title: '用户详情', activeMenu: '/admin/user' }
      },
      {
        path: 'role',
        name: 'AdminRole',
        component: () => import('@/views/admin/role/index.vue'),
        meta: { title: '角色管理' }
      },
      {
        path: 'role/:id',
        name: 'AdminRoleDetail',
        component: () => import('@/views/admin/role/detail.vue'),
        hidden: true,
        meta: { title: '角色详情', activeMenu: '/admin/role' }
      },
      {
        path: 'role/:id/users',
        name: 'AdminRoleUsers',
        component: () => import('@/views/admin/role/users.vue'),
        hidden: true,
        meta: { title: '分配人员', activeMenu: '/admin/role' }
      },
      {
        path: 'permission',
        name: 'AdminPermission',
        component: () => import('@/views/admin/permission/index.vue'),
        meta: { title: '权限管理' }
      },
      {
        path: 'department',
        name: 'AdminDepartment',
        component: () => import('@/views/admin/department/index.vue'),
        meta: { title: '部门管理' }
      },
      {
        path: 'processor',
        name: 'AdminProcessor',
        component: () => import('@/views/admin/processor/index.vue'),
        meta: { title: '经办人管理' }
      }
    ]
  },
  {
    path: '/audit',
    component: Layout,
    redirect: '/audit/login-log',
    meta: { title: '日志与审计', icon: 'table' },
    children: [
      {
        path: 'login-log',
        name: 'LoginLog',
        component: () => import('@/views/audit/login-log/index.vue'),
        meta: { title: '登录日志' }
      },
      {
        path: 'audit-log',
        name: 'AuditLog',
        component: () => import('@/views/audit/audit-log/index.vue'),
        meta: { title: '审计日志' }
      },
      {
        path: 'operation-log',
        name: 'OperationLog',
        component: () => import('@/views/audit/operation-log/index.vue'),
        meta: { title: '操作日志' }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    redirect: '/system/config',
    meta: { title: '系统管理', icon: 'tree' },
    children: [
      {
        path: 'config',
        name: 'SystemConfig',
        component: () => import('@/views/system/config/index.vue'),
        meta: { title: '系统配置' }
      },
      {
        path: 'accountType',
        name: 'SystemAccountType',
        component: () => import('@/views/system/accountType/index.vue'),
        meta: { title: '账号类型' }
      },
      {
        path: 'address',
        name: 'SystemAddress',
        component: () => import('@/views/system/address/index.vue'),
        meta: { title: '地址管理' }
      },
      {
        path: 'account',
        name: 'SystemAccount',
        component: () => import('@/views/system/account/index.vue'),
        meta: { title: '账号管理' }
      },
      {
        path: 'service-provider-user',
        name: 'SystemServiceProviderUser',
        component: () => import('@/views/system/accountServiceProvider/index.vue'),
        meta: { title: '服务商账号管理' }
      },
      {
        path: 'service-provider-user/:userId/service-scope',
        name: 'SystemServiceProviderUserScope',
        component: () => import('@/views/system/serviceScope/index.vue'),
        hidden: true,
        meta: { title: '服务范围管理', activeMenu: '/system/service-provider-user' }
      },
      {
        path: 'service-provider-user/:userId/customer',
        name: 'SystemServiceProviderCustomer',
        component: () => import('@/views/system/customer/index.vue'),
        hidden: true,
        meta: { title: '客户管理', activeMenu: '/system/service-provider-user' }
      },
      {
        path: 'bank',
        name: 'SystemBankInfo',
        component: () => import('@/views/system/bankInfo/index.vue'),
        meta: { title: '银行账号管理' }
      },
      {
        path: 'site',
        name: 'SystemSite',
        component: () => import('@/views/system/site/index.vue'),
        meta: { title: '站点管理' }
      },
      {
        path: 'dict',
        name: 'SystemDict',
        component: () => import('@/views/system/dict/index.vue'),
        meta: { title: '字典管理' }
      },
      {
        path: 'dict/data',
        name: 'SystemDictData',
        component: () => import('@/views/system/dict/data.vue'),
        hidden: true,
        meta: { title: '字典数据', activeMenu: '/system/dict' }
      },
      {
        path: 'file',
        name: 'SystemFile',
        component: () => import('@/views/system/file/index.vue'),
        meta: { title: '文件管理' }
      }
    ]
  },
  {
    path: '/recycle',
    component: Layout,
    redirect: '/recycle/constract',
    meta: { title: '回收业务', icon: 'table' },
    children: [
      {
        path: 'constract',
        name: 'RecycleConstract',
        component: () => import('@/views/recycle/constract/index.vue'),
        meta: { title: '合同管理' }
      },
      {
        path: 'business-scope',
        name: 'RecycleBusinessScope',
        component: () => import('@/views/recycle/business-scope/index.vue'),
        meta: { title: '经营范围管理' }
      },
      {
        path: 'order',
        name: 'RecycleOrder',
        component: () => import('@/views/recycle/order/index.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'fundflow',
        name: 'FundFlow',
        component: () => import('@/views/recycle/order/fundflow/index.vue'),
        meta: { title: '走款管理' }
      },
      {
        path: 'order/edit/:orderId?',
        name: 'OrderEdit',
        component: () => import('@/views/recycle/order/OrderEdit.vue'),
        hidden: true,
        meta: { title: '订单编辑', activeMenu: '/recycle/order' }
      },
      {
        path: 'order/settlement/:orderId',
        name: 'SettlementPDF',
        component: () => import('@/views/recycle/order/SettlementPDF.vue'),
        hidden: true,
        meta: { title: '结算单预览', activeMenu: '/recycle/order' }
      },
      {
        path: 'order/application/:orderId',
        name: 'ApplicationPDF',
        component: () => import('@/views/recycle/order/ApplicationPDF.vue'),
        hidden: true,
        meta: { title: '业务申请单预览', activeMenu: '/recycle/order' }
      }
    ]
  },
  {
    path: '/invoice',
    component: Layout,
    redirect: '/invoice/list',
    meta: { title: '发票管理', icon: 'form' },
    children: [
      {
        path: 'title',
        name: 'InvoiceTitle',
        component: () => import('@/views/invoice/title/index.vue'),
        meta: { title: '发票抬头管理' }
      },
      {
        path: 'list',
        name: 'InvoiceList',
        component: () => import('@/views/invoice/list/index.vue'),
        meta: { title: '发票管理' }
      }
    ]
  },
  {
    path: '/wx',
    component: Layout,
    redirect: '/wx/user/list',
    meta: { title: '微信管理', icon: 'user' },
    children: [
      {
        path: 'user/list',
        name: 'WxUserList',
        component: () => import('@/views/wx/user/list/index.vue'),
        meta: { title: '微信用户' }
      }
    ]
  },
  {
    path: '/userOrder',
    component: Layout,
    redirect: '/userOrder/list',
    meta: { title: '用户订单', icon: 'form' },
    children: [
      {
        path: 'list',
        name: 'UserOrderList',
        component: () => import('@/views/userOrder/userOrderList.vue'),
        meta: { title: '订单列表' }
      },
      {
        path: 'add',
        name: 'UserOrderAdd',
        component: () => import('@/views/userOrder/userOrderAdd.vue'),
        hidden: true,
        meta: { title: '添加/编辑订单', activeMenu: '/userOrder/list' }
      },
      {
        path: 'register',
        name: 'UserOrderRegister',
        component: () => import('@/views/userOrder/userOrderRegister.vue'),
        hidden: true,
        meta: { title: '信息登记', activeMenu: '/userOrder/list' }
      },
      {
        path: 'purchase',
        name: 'UserOrderPurchase',
        component: () => import('@/views/userOrder/userOrderPurchase.vue'),
        hidden: true,
        meta: { title: '登记采购信息', activeMenu: '/userOrder/list' }
      },
      {
        path: 'transport',
        name: 'UserOrderTransport',
        component: () => import('@/views/userOrder/userOrderTransport.vue'),
        hidden: true,
        meta: { title: '登记运输信息', activeMenu: '/userOrder/list' }
      },
      {
        path: 'processing',
        name: 'UserOrderProcessing',
        component: () => import('@/views/userOrder/userOrderProcessing.vue'),
        hidden: true,
        meta: { title: '登记加工信息', activeMenu: '/userOrder/list' }
      },
      {
        path: 'warehousing',
        name: 'UserOrderWarehousing',
        component: () => import('@/views/userOrder/userOrderWarehousing.vue'),
        hidden: true,
        meta: { title: '登记入库信息', activeMenu: '/userOrder/list' }
      }
    ]
  },
  {
    path: '/rental',
    component: Layout,
    redirect: '/rental/contract',
    meta: { title: '租赁', icon: 'nested' },
    children: [
      {
        path: 'index',
        name: 'RentalCategories',
        component: () => import('@/views/categories/index.vue'),
        meta: { title: '租赁分类管理' }
      },
      {
        path: 'contract',
        name: 'RentalContract',
        component: () => import('@/views/rental/contract/index.vue'),
        meta: { title: '租赁合同' }
      },
      {
        path: 'goods',
        name: 'RentalGoods',
        component: () => import('@/views/rental/goods/index.vue'),
        meta: { title: '租赁商品' }
      },
      {
        path: 'order',
        name: 'RentalOrder',
        component: () => import('@/views/rental/order/index.vue'),
        meta: { title: '租赁订单' }
      }
    ]
  },
  {
    path: '/inventory',
    component: Layout,
    redirect: '/inventory/list',
    meta: { title: '库存', icon: 'table' },
    children: [
      {
        path: 'statistics',
        name: 'InventoryStatistics',
        component: () => import('@/views/inventory/statistics/index.vue'),
        meta: { title: '库存统计' }
      },
      {
        path: 'warehouse',
        name: 'WarehouseManagement',
        component: () => import('@/views/inventory/warehouse/index.vue'),
        meta: { title: '仓库管理' }
      },
      {
        path: 'list',
        name: 'InventoryList',
        component: () => import('@/views/inventory/list/index.vue'),
        meta: { title: '库存列表' }
      },
      {
        path: 'inbound',
        name: 'InboundManagement',
        component: () => import('@/views/inventory/inbound/index.vue'),
        meta: { title: '入库管理' }
      },
      {
        path: 'inbound/detail/:id',
        name: 'InboundDetail',
        component: () => import('@/views/inventory/inbound/detail.vue'),
        hidden: true,
        meta: { title: '入库单详情', activeMenu: '/inventory/inbound' }
      },
      {
        path: 'outbound',
        name: 'OutboundManagement',
        component: () => import('@/views/inventory/outbound/index.vue'),
        meta: { title: '出库管理' }
      },
      {
        path: 'outbound/detail/:id',
        name: 'OutboundDetail',
        component: () => import('@/views/inventory/outbound/detail.vue'),
        hidden: true,
        meta: { title: '出库单详情', activeMenu: '/inventory/outbound' }
      },
      {
        path: 'transaction',
        name: 'TransactionLog',
        component: () => import('@/views/inventory/transaction/index.vue'),
        meta: { title: '库存流水' }
      }
    ]
  },
  {
    path: '/finance',
    component: Layout,
    redirect: '/finance/capitalpool',
    meta: { title: '财务', icon: 'table' },
    children: [
      {
        path: 'capitalpool',
        name: 'CapitalPool',
        component: () => import('@/views/finance/capitalpool/index.vue'),
        meta: { title: '资金池' }
      }
    ]
  },
  {
    path: '/points',
    component: Layout,
    redirect: '/points/detail',
    meta: { title: '积分', icon: 'form' },
    children: [
      {
        path: 'detail',
        name: 'PointsDetail',
        component: () => import('@/views/points/detail/index.vue'),
        meta: { title: '积分明细' }
      },
      {
        path: 'use-detail',
        name: 'PointsUseDetail',
        component: () => import('@/views/points/use-detail/index.vue'),
        meta: { title: '兑换管理' }
      },
      {
        path: 'goods',
        name: 'PointsGoods',
        component: () => import('@/views/points/goods/index.vue'),
        meta: { title: '积分商品' }
      },
      {
        path: 'category',
        name: 'PointsCategory',
        component: () => import('@/views/points/category/index.vue'),
        meta: { title: '商品分类' }
      },
      {
        path: 'rule',
        name: 'PointsRule',
        component: () => import('@/views/points/rule/index.vue'),
        meta: { title: '积分规则' }
      }
    ]
  },
  {
    path: '/report',
    component: Layout,
    redirect: '/report/inventory',
    meta: { title: '报表', icon: 'table' },
    children: [
      {
        path: 'inventory',
        name: 'InventoryReport',
        component: () => import('@/views/report/inventory/index.vue'),
        meta: { title: '库存报表' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    hidden: true,
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ top: 0 })
})

export default router
