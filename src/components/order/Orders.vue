<template>
  <div>
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>Order Management</el-breadcrumb-item>
      <el-breadcrumb-item>Order List</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- main area: search box, add user button and user table -->
    <el-card class="box-card">
      <!-- search box and add a user button area -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="Search an order"
            v-model="queryInfo.query"
            clearable
            @keyup.enter.native="getOrderList()"
            @clear="getOrderList()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrderList()"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- order table area -->
      <!-- We need to bind orderList to data attribute of el-table -->
      <el-table :data="orderList" stripe style="width: 100%" border>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="order_number" label="Order ID" width="260px">
        </el-table-column>
        <el-table-column prop="order_price" label="Order Price">
        </el-table-column>
        <el-table-column label="Payment Status">
          <template v-slot="scope">
            <el-tag type="success" size="mini" v-if="scope.row.order_pay === 0"
              >Paid</el-tag
            >
            <el-tag type="danger" size="mini" v-else>Not Paid</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="Shipping"> </el-table-column>
        <el-table-column prop="create_time" label="Created time" width="140px">
          <template v-slot="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="Operations" width="180px">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showDeliveryProgressDialog()"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- Pagination -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- edit address dialog -->
    <el-dialog
      title="Edit a Order's Address"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="120px"
      >
        <el-form-item label="State/County/City">
          <el-cascader
            :options="cityData"
            v-model="editForm.address1"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="Address">
          <el-input v-model="editForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="updateAddress()">Update</el-button>
      </span>
    </el-dialog>
    <!-- show delivery progress dialog -->
    <el-dialog
      title="Order's Delivery Progress"
      :visible.sync="deliveryProgressDialogVisible"
      width="50%"
      @close="deliveryProgressDialogClosed"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
// important state, county and city data in this vue file
import cityData from './citydata.js'
export default {
  data() {
    return {
      // params of method getUserList()
      queryInfo: {
        query: '', // search criteria
        pagenum: 1,
        pagesize: 10
      },
      orderList: [], // a list of orders that match queryInfo
      total: 0, // total number of orders that match queryInfo
      editDialogVisible: false,
      editForm: {
        address1: [], // state, county and city
        address2: '' // street, house number etc
      },
      editFormRules: {
        address1: [
          {
            required: true,
            message: 'Please input state, county and city',
            trigger: 'blur'
          }
        ],
        address2: [
          {
            required: true,
            message: 'Please input street name',
            trigger: 'blur'
          }
        ]
      },
      cityData,
      deliveryProgressDialogVisible: false,
      progressInfo: [] // delivery information of an order, it is an array
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('/orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('Obtain Users List Failure')
      }
      // update data object
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      // since there is a newSize, we request data again
      this.getOrderList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      // since there is a new page num, request data on that page
      this.getOrderList()
    },
    async showEditDialog(userInfo) {
      this.editDialogVisible = true
    },
    // reset edit form when edit dialog is closed
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    async showDeliveryProgressDialog() {
      const { data: res } = await this.$http.get('/kuaidi/' + 1106975712662)
      if (res.meta.status !== 200) {
        return this.$message.error('Obtain delivery progress failure')
      }
      this.progressInfo = res.data
      this.deliveryProgressDialogVisible = true
    },
    deliveryProgressDialogClosed() {}
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
