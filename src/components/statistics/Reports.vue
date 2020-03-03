<template>
  <div>
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>Statistics</el-breadcrumb-item>
      <el-breadcrumb-item>Reports</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <!-- prepare a DOM container with width and height -->
      <div id="main" style="width: 600px;height:400px;"></div>
    </el-card>
  </div>
</template>
<script>
import echarts from 'echarts'
import _ from 'lodash'
export default {
  data() {
    return {
      // need to merge with the requested data
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created() {},
  // when DOM is ready, mounted will be executed, this is like window.onload
  async mounted() {
    // based on prepared DOM, initialize echarts instance
    var myChart = echarts.init(document.getElementById('main'))

    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('Obtain data error')
    }
    const result = _.merge(res.data, this.options)
    // specify chart configuration item and data
    // use configuration item and data specified to show chart
    myChart.setOption(result)
  },
  methods: {}
}
</script>
<style lang="less" scoped></style>
