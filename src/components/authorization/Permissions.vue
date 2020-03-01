<template>
  <div>
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>Authorization</el-breadcrumb-item>
      <el-breadcrumb-item>Permission List</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- Card view -->
    <el-card class="box-card">
      <!-- permission list area -->
      <!-- We need to bind permissionList to data attribute of el-table -->
      <el-table :data="permissionList" stripe style="width: 100%" border>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="authName" label="Permission name" width="180">
        </el-table-column>
        <el-table-column prop="path" label="Path" width="180">
        </el-table-column>
        <el-table-column prop="level" label="Permission level">
          <template v-slot="scope">
            <el-tag v-if="scope.row.level === '0'">
              Level 1
            </el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">
              Level 2
            </el-tag>
            <el-tag type="warning" v-else>
              Level 3
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <!-- Pagination -->
      <!-- <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="queryInfo.pagenum"
        :page-sizes="[2, 3, 4, 5]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination> -->
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // all the permissions
      permissionList: []
    }
  },
  created() {
    this.getPermissionList()
  },
  methods: {
    // get permision list from backend
    async getPermissionList() {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('Obtain Permission List Failure')
      }
      this.permissionList = res.data
    }
  }
}
</script>
<style lang="less" scoped></style>
