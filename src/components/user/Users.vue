<template>
  <div>
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>User Management</el-breadcrumb-item>
      <el-breadcrumb-item>User List</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- main area: search box, add user button and user table -->
    <el-card class="box-card">
      <!-- search box and add a user button area -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="Search a user"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList()"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >Add User</el-button
          >
        </el-col>
      </el-row>
      <!-- user table area -->
      <!-- We need to bind userList to data attribute of el-table -->
      <el-table :data="userList" stripe style="width: 100%" border>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="username" label="Username" width="180">
        </el-table-column>
        <el-table-column prop="email" label="Email" width="180">
        </el-table-column>
        <el-table-column prop="mobile" label="Mobile"> </el-table-column>
        <el-table-column prop="role_name" label="Role"> </el-table-column>
        <el-table-column label="Status">
          <template slot-scope="scope">
            <!-- scope.row represents the record, this slot-scope syntax is deprecated in Vue 2.6 -->
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="updateStatus(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="Operations" width="180px">
          <template slot-scope="scope">
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
              @click="deleteById(scope.row.id)"
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="Assign Role"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showAssignRoleDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- Pagination -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="queryInfo.pagenum"
        :page-sizes="[2, 3, 4, 5]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- add a user dialog -->
    <el-dialog
      title="Add a User"
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
        <el-form-item label="Username" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="Mobile" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addUser">Add</el-button>
      </span>
    </el-dialog>
    <!-- edit a user dialog -->
    <el-dialog
      title="Edit a User's Info"
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
        <el-form-item label="Username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="Mobile" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="updateUser(editForm.id)"
          >Update</el-button
        >
      </span>
    </el-dialog>
    <!-- Assign roles to a user dialog -->
    <el-dialog
      title="Assign Role to User"
      :visible.sync="assignRoleDialogVisible"
      width="50%"
      @close="assignRoleDialogClosed"
    >
      <div>
        <p>Current user: {{ userInfo.username }}</p>
        <p>Current roles: {{ userInfo.role_name }}</p>
        <el-select v-model="selectedRoleId" placeholder="Select">
          <el-option
            v-for="item in roleList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignRoleDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveSelectedRole()">Update</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // function to check email format
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        return cb()
      }

      cb(new Error('Not valid Email'))
    }
    // function to check phone format
    var checkPhone = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('Not valid phone number'))
    }
    return {
      // params of method getUserList()
      queryInfo: {
        query: '', // search criteria, username
        pagenum: 1,
        pagesize: 2
      },
      userList: [], // a list of users that match queryInfo
      total: 0, // total number of users that match queryInfo
      // Add a user dialog visibility
      addDialogVisible: false,
      // data in the add a user form
      addForm: {
        username: '',
        password: '',
        mobile: '',
        email: ''
      },
      addFormRules: {
        username: [
          {
            required: true,
            message: 'Please input username',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: 'Length should be 3 to 10',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: 'Please input password',
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: 'Please input phone',
            trigger: 'blur'
          },
          { validator: checkPhone, trigger: 'blur' }
        ],
        email: [
          {
            required: true,
            message: 'Please input email',
            trigger: 'blur'
          },
          { validator: checkEmail, trigger: 'blur' }
        ]
      },
      // control edit a user dialog visibility
      editDialogVisible: false,
      // data in the edit a user form
      editForm: {},
      // control assign role dialog visibility
      assignRoleDialogVisible: false,
      // The user who will be assigned a new role in assign a user dialog
      userInfo: {},
      // all the roles available to select
      roleList: [],
      // selected role Id of this user
      selectedRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('/users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('Obtain Users List Failure')
      }
      // update data object
      this.userList = res.data.users
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      // since there is a newSize, we request data again
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      // since there is a new page num, request data on that page
      this.getUserList()
    },
    async updateStatus(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        // if fail, we need to make sure the page stays the same
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('Update failure')
      }
      this.$message.success('Update Success')
    },
    // handles dialog closed event
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // use axios to add a user
        const { data: res } = await this.$http.post('/users', this.addForm)
        if (res.meta.status !== 200) this.$message.error('Add User Error')
        this.$message.success('Add User Success')
        // hide add user dialog
        this.addDialogVisible = false
        // get the latest data
        this.getUserList()
      })
    },
    async showEditDialog(userInfo) {
      const { data: res } = await this.$http.get('users/' + userInfo.id)
      if (res.meta.status !== 200) this.$message.error('Find a User Error')
      // populate the edit form
      this.editForm = res.data
      this.editDialogVisible = true
    },
    updateUser(id) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // use axios to update this user
        const { data: res } = await this.$http.put('users/' + id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('Update a User Error')
        }
        this.$message.success('Update a User Success')
        this.editDialogVisible = false
        // get the latest data
        this.getUserList()
      })
    },
    // rest edit form when edit dialog is closed
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    async deleteById(id) {
      // ask if you really want to delete this user
      this.$confirm(
        'This will permanently delete this user. Continue?',
        'Warning',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      )
        .then(async () => {
          const { data: res } = await this.$http.delete('users/' + id)
          if (res.meta.status !== 200) {
            this.$message.error('Delete a User Error')
          }
          this.$message.success('Delete a User Success')
          // get the latest data
          this.getUserList()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: 'Delete canceled'
          })
        })
    },
    async showAssignRoleDialog(userInfo) {
      this.userInfo = userInfo
      // obtain all roles from backend
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('Obtain Role List Failure')
      }
      this.roleList = res.data

      this.assignRoleDialogVisible = true
    },
    async saveSelectedRole() {
      if (!this.selectedRoleId) {
        return this.$message.error('Please select a role')
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      )
      if (res.meta.status !== 200) {
        console.log(res.meta.msg)
        return this.$message.error('Update role failure')
      }
      this.$message.success('Update role success')
      this.getUserList()
      this.assignRoleDialogVisible = false
    },
    // reset assignRoleDialog when it is closed
    assignRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = ''
    }
  }
}
</script>
<style lang="less" scoped></style>
