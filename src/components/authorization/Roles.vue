<template>
  <div>
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>Authorization</el-breadcrumb-item>
      <el-breadcrumb-item>Roles List</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- Card view -->
    <el-card class="box-card">
      <!-- add a role area -->
      <el-row :gutter="20">
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >Add Role</el-button
          >
        </el-col>
      </el-row>
      <!-- role list area -->
      <el-table :data="roleList" stripe style="width: 100%" border>
        <!-- Expand column -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- Level 1 permission -->
              <el-col :span="8">
                <el-tag
                  closable
                  @close="removePermissionById(scope.row, item1.id)"
                >
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- Level 2 and 3 permissions -->
              <el-col :span="16">
                <!-- Levet 2 permissions -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removePermissionById(scope.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- Levet 3 permissions -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removePermissionById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="roleName" label="Role name"> </el-table-column>
        <el-table-column prop="roleDesc" label="Description"> </el-table-column>
        <el-table-column label="Operations">
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
              content="Assign Permissions"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showSetPermissionDialog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- add role dialog -->
    <el-dialog
      title="Add a Role"
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
        <el-form-item label="Role Name" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="Description" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addRole">Add</el-button>
      </span>
    </el-dialog>
    <!-- edit role dialog -->
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
        <el-form-item label="Role Name">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="Description" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="updateRole()">Update</el-button>
      </span>
    </el-dialog>
    <!-- Assign permissions to a role dialog -->
    <el-dialog
      title="Assign Permissions"
      :visible.sync="setPermissionsDialogVisible"
      width="50%"
      @close="setPermissionDialogClosed"
    >
      <!-- tree component to show all permissions and the permissions this role has currently -->
      <el-tree
        :data="permissionList"
        :props="defaultProps"
        show-checkbox
        default-expand-all
        node-key="id"
        ref="tree"
        :default-checked-keys="defaultCheckedKeys"
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setPermissionsDialogVisible = false"
          >Cancel</el-button
        >
        <el-button type="primary" @click="updatePermissionsOfRole()"
          >Confirm</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      roleList: [],
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addFormRules: {
        roleName: [
          {
            required: true,
            message: 'Please input role name',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            required: true,
            message: 'Please input description',
            trigger: 'blur'
          }
        ]
      },
      addDialogVisible: false,
      editDialogVisible: false,
      editForm: {},
      setPermissionsDialogVisible: false,
      permissionList: [],
      // used to tell tree component which is children which is label in permissionList
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      // ids of permissions of a role
      defaultCheckedKeys: [],
      // the Id of the role that will be assigned new permissions
      roleId: ''
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    // get permision list from backend
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('Obtain Role List Failure')
      }
      this.roleList = res.data
    },
    // handles dialog closed event
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // use axios to add a role
        const { data: res } = await this.$http.post('/roles', this.addForm)
        if (res.meta.status !== 200) this.$message.error('Add Role Error')
        this.$message.success('Add Role Success')
        // hide add role dialog
        this.addDialogVisible = false
        // get the latest data
        this.getRoleList()
      })
    },
    updateRole() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // use axios to update this role
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          {
            roleId: this.editForm.roleId,
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          console.log(res.meta.msg)
          return this.$message.error('Update a Role Error')
        }
        this.$message.success('Update a Role Success')
        this.editDialogVisible = false
        // get the latest data
        this.getRoleList()
      })
    },
    // rest edit form when edit dialog is closed
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    async showEditDialog(roleInfo) {
      const { data: res } = await this.$http.get('roles/' + roleInfo.id)
      if (res.meta.status !== 200) this.$message.error('Find a Role Error')
      // populate the edit form
      this.editForm = res.data
      this.editDialogVisible = true
    },
    async deleteById(id) {
      // ask if you really want to delete this role
      this.$confirm(
        'This will permanently delete this role. Continue?',
        'Warning',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      )
        .then(async () => {
          const { data: res } = await this.$http.delete('roles/' + id)
          if (res.meta.status !== 200) {
            this.$message.error('Delete a Role Error')
          }
          this.$message.success('Delete a Role Success')
          // get the latest data
          this.getRoleList()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: 'Delete canceled'
          })
        })
    },
    async removePermissionById(roleInfo, rightId) {
      // ask if you really want to delete this role
      this.$confirm(
        'This will permanently delete this permision. Continue?',
        'Warning',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      )
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `roles/${roleInfo.id}/rights/${rightId}`
          )
          if (res.meta.status !== 200) {
            this.$message.error('Delete a Permission from role Error')
          }
          this.$message.success('Delete a Permission from role Success')
          // get the latest data of this role
          roleInfo.children = res.data
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: 'Delete canceled'
          })
        })
    },
    async showSetPermissionDialog(roleInfo) {
      // get all the permissions of this role
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('Obtain Permission Tree Failure')
      }
      // get all permissions
      this.permissionList = res.data
      // check all the permission items this role currently has
      this.getLeafKeys(roleInfo, this.defaultCheckedKeys)
      // save the id of this rol
      this.roleId = roleInfo.id
      this.setPermissionsDialogVisible = true
    },
    // a recursive method that add level 3 permissions to arr
    getLeafKeys(node, arr) {
      // if we reach to leaf
      if (!node.children) {
        return arr.push(node.id)
      } else {
        node.children.forEach(child => {
          this.getLeafKeys(child, arr)
        })
      }
    },
    // when set permission dialog closes, clear the array defaultCheckedKeys
    setPermissionDialogClosed() {
      this.defaultCheckedKeys = []
    },
    async updatePermissionsOfRole() {
      const keys = [
        ...this.$refs.tree.getCheckedKeys(),
        ...this.$refs.tree.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: idStr
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('Update Permission Failure')
      }
      this.$message.success('Update Permission Success')
      this.getRoleList()
      this.setPermissionsDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
