<template>
  <div>
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>Goods Management</el-breadcrumb-item>
      <el-breadcrumb-item>Category List</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- main area: search box, add user button and user table -->
    <el-card class="box-card">
      <!-- search box and add a user button area -->
      <el-row>
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialog"
            >Add a Category</el-button
          >
        </el-col>
      </el-row>

      <!-- category table area -->
      <tree-table
        class="treeTable"
        :data="categoryList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- template for the second column of this table, shows whether a category is still active or not -->
        <template slot="isActive" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" v-else></i>
        </template>
        <!-- template for the third column of this table, shows the level of this category -->
        <template slot="level" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">Level 1</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >Level 2</el-tag
          >
          <el-tag type="warning" size="mini" v-else>Level 3</el-tag>
        </template>
        <!-- template for the last column of this table, shows operations of this category -->
        <template slot="operations" slot-scope="scope">
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
            @click="deleteById(scope.row.cat_id)"
          ></el-button>
        </template>
      </tree-table>
      <!-- Pagination -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- add a category dialog -->
    <el-dialog
      title="Add a Category"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="120px"
      >
        <el-form-item label="Category name" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="Parent category">
          <!-- options means where to get data for this cascader -->
          <el-cascader
            v-model="selectedParentCategories"
            :options="parentCategories"
            :props="cascaderProps"
            @change="handleParentCategoryChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addCategory">Add</el-button>
      </span>
    </el-dialog>
    <!-- edit a category dialog -->
    <el-dialog
      title="Edit a Category"
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
        <el-form-item label="Category name" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="updateCategory(editForm.cat_id)"
          >Update</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script src="//unpkg.com/element-ui@2.13.0/lib/index.js"></script>
<script>
export default {
  data() {
    return {
      categoryList: [],
      // search criteria
      queryInfo: {
        type: 3, // by default, we want all three level categories
        pagenum: 1,
        pagesize: 5
      },
      total: 0, // total number of level 1 categories
      columns: [
        { label: 'Category', prop: 'cat_name' },
        // scoped slot
        { label: 'Active', type: 'template', template: 'isActive' },
        { label: 'Level', type: 'template', template: 'level' },
        { label: 'Operations', type: 'template', template: 'operations' }
      ],
      addDialogVisible: false,
      addForm: {
        cat_pid: 0, // by default, pid is zero
        cat_name: '',
        cat_level: 0 // depends on the level of parent category
      },
      addFormRules: {
        cat_name: [
          {
            required: true,
            message: 'Please input category name',
            trigger: 'blur'
          }
        ]
      },
      // stores all level 1 and level 2 categories, used in add cat dialog
      parentCategories: [],
      // tells cascader what information to retrive from parentCategories
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id', // cat_id will be selected once user clicks an item
        label: 'cat_name', // this is what a user will see in this cascader
        children: 'children'
      },
      selectedParentCategories: [],
      // control edit a category dialog visibility
      editDialogVisible: false,
      // data in the edit a category form
      editForm: {}
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    async getCategoryList() {
      const { data: res } = await this.$http.get('/categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('Obtain Category List Failure')
      }
      // update data object
      this.categoryList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      // since there is a newSize, we request data again
      this.getCategoryList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      // since there is a new page num, request data on that page
      this.getCategoryList()
    },
    // this method gets called when user clicks "add a new category"
    // we are preparing all the level 1 and 2 categories
    async getParentCategories() {
      const { data: res } = await this.$http.get('/categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        this.$message.error('Obtain Parent Category Error')
      }
      // this.$message.success('Obtain Parent Category Success')
      this.parentCategories = res.data
    },
    showAddDialog() {
      // prepare the dropdown parent categories for the add form
      this.getParentCategories()
      this.addDialogVisible = true
    },
    // when a user selects a parent category for the new category to be added
    handleParentCategoryChange() {
      // if there is parent selected, we need to set pid and level of this category
      // if this array is not empty
      if (this.selectedParentCategories.length > 0) {
        // find the last id in selectedParentCategories array
        this.addForm.cat_pid = this.selectedParentCategories[
          this.selectedParentCategories.length - 1
        ]
        // the level of this category is equal to the length of selectedParentCategories
        this.addForm.cat_level = this.selectedParentCategories.length
      } else {
        // if we didn't select any parent category
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }
    },
    // handles add dialog closed event
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
      this.selectedParentCategories = []
      this.addForm.cat_level = 0
      this.addForm.cat_pid = 0
    },
    addCategory() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // use axios to add a user
        const { data: res } = await this.$http.post('/categories', this.addForm)
        if (res.meta.status !== 200) this.$message.error('Add Category Error')
        this.$message.success('Add Category Success')
        // hide add dialog
        this.addDialogVisible = false
        // get the latest data
        this.getCategoryList()
      })
    },

    async showEditDialog(categoryInfo) {
      const { data: res } = await this.$http.get('categories/' + categoryInfo.cat_id)
      if (res.meta.status !== 200) this.$message.error('Find a category Error')
      // populate the edit form
      this.editForm = res.data
      this.editDialogVisible = true
    },
    updateCategory(id) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // use axios to update this category
        const { data: res } = await this.$http.put('categories/' + id, {
          cat_name: this.editForm.cat_name
        })
        if (res.meta.status !== 200) {
          return this.$message.error('Update a Category Error')
        }
        this.$message.success('Update a Category Success')
        this.editDialogVisible = false
        // get the latest data
        this.getCategoryList()
      })
    },
    // rest edit form when edit dialog is closed
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    async deleteById(id) {
      // ask if you really want to delete this category
      this.$confirm(
        'This will permanently delete this category. Continue?',
        'Warning',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      )
        .then(async () => {
          const { data: res } = await this.$http.delete('categories/' + id)
          if (res.meta.status !== 200) {
            this.$message.error('Delete a Category Error')
          }
          this.$message.success('Delete a Category Success')
          // get the latest data
          this.getCategoryList()
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
<style lang="less" scoped>
.treeTable {
  margin-top: 30px;
}
.el-cascader {
  width: 100%;
}
</style>
