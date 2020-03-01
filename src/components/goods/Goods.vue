<template>
  <div>
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>Goods Management</el-breadcrumb-item>
      <el-breadcrumb-item>Goods List</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- main area: search box, add product button and goods list table -->
    <el-card class="box-card">
      <!-- search box and add a product button area -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="Search a product"
            v-model="queryInfo.query"
            clearable
            @keyup.enter.native="getGoodsList()"
            @clear="getGoodsList()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList()"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goToAddPage">Add Product</el-button>
        </el-col>
      </el-row>
      <!-- goods table area -->
      <el-table :data="goodsList" stripe style="width: 100%" border>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="goods_name" label="Product name">
        </el-table-column>
        <el-table-column prop="goods_price" label="Price" width="90px">
        </el-table-column>
        <el-table-column prop="goods_weight" label="Weight" width="90px">
        </el-table-column>
        <el-table-column prop="add_time" label="Created time" width="140px">
          <template v-slot="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="Operations" width="130px">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteById(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- Pagination -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 40, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- edit a product dialog -->
    <el-dialog
      title="Edit a Product's Info"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="addFormRules"
        label-width="120px"
      >
        <el-form-item label="Product name" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="Price" prop="goods_price">
          <el-input v-model="editForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="Weight" prop="goods_weight">
          <el-input v-model="editForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="updateProduct(editForm.id)"
          >Update</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // params of method getGoodsList()
      queryInfo: {
        query: '', // search criteria
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [], // a list of goods that match queryInfo
      total: 0, // total number of goods that match queryInfo
      // control edit a product dialog visibility
      editDialogVisible: false,
      // data in the edit a product form
      editForm: {},
      addFormRules: {
        goods_name: [
          {
            required: true,
            message: 'Please input product name',
            trigger: 'blur'
          }
        ],
        goods_price: [
          {
            required: true,
            message: 'Please input product price',
            trigger: 'blur'
          }
        ],
        goods_weight: [
          {
            required: true,
            message: 'Please input product weight',
            trigger: 'blur'
          }
        ],
        goods_number: [
          {
            required: true,
            message: 'Please input product amount',
            trigger: 'blur'
          }
        ],
        goods_cat: [
          {
            required: true,
            message: 'Please input product category',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('/goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('Obtain Goods List Failure')
      }
      // update data object
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      // since there is a newSize, we request data again
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      // since there is a new page num, request data on that page
      this.getGoodsList()
    },
    // when user clicks add a product  button, we go to a different page
    goToAddPage() {
      this.$router.push('/goods/add')
    },
    async showEditDialog(productInfo) {
      const { data: res } = await this.$http.get(
        '/goods/' + productInfo.goods_id
      )
      if (res.meta.status !== 200) this.$message.error('Find a product Error')
      // populate the edit form
      this.editForm = res.data
      this.editDialogVisible = true
    },
    updateProduct(id) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // use axios to update this product
        const { data: res } = await this.$http.put('/goods/' + id, {})
        if (res.meta.status !== 200) {
          return this.$message.error('Update a product Error')
        }
        this.$message.success('Update a product Success')
        this.editDialogVisible = false
        // get the latest data
        this.getGoodsList()
      })
    },
    // reset edit form when edit dialog is closed
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    async deleteById(id) {
      // ask if you really want to delete this product
      this.$confirm(
        'This will permanently delete this product. Continue?',
        'Warning',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      )
        .then(async () => {
          const { data: res } = await this.$http.delete('/goods/' + id)
          if (res.meta.status !== 200) {
            this.$message.error('Delete a product Error')
            console.log(res.meta.msg)
          }
          this.$message.success('Delete a product Success')
          // get the latest data
          this.getGoodsList()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: 'Delete canceled'
          })
        })
    }
  }
}
</script>
<style lang="less" scoped></style>
