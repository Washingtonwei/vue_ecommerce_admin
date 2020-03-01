<template>
  <div>
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>Goods Management</el-breadcrumb-item>
      <el-breadcrumb-item>Add a Product</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- main area: Alert message, Steps bar and tabs -->
    <el-card class="box-card">
      <!-- alert box -->
      <el-alert
        title="Please Complete Product Information"
        type="info"
        center
        show-icon
      >
      </el-alert>
      <!-- Steps bar -->
      <el-steps
        :space="200"
        :active="activeStep - 0"
        finish-status="success"
        align-center
      >
        <el-step title="Basic Information"></el-step>
        <el-step title="Dynamic Attributes"></el-step>
        <el-step title="Static Attributes"></el-step>
        <el-step title="Picture"></el-step>
        <el-step title="Content"></el-step>
        <el-step title="Complete"></el-step>
      </el-steps>
      <!-- Tabs area, we use form to encapsulate the tabs -->
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="120px"
      >
        <!-- Take a look at before-leave property -->
        <el-tabs
          v-model="activeStep"
          :tab-position="'left'"
          style="height: 500px;"
          :before-leave="beforeTabLeave"
          @tab-click="handleTabClick"
        >
          <!-- Basic information of this new product -->
          <el-tab-pane label="Basic Info" name="0">
            <!-- prop is for validation rule -->
            <el-form-item label="Product name" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="Price" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="Weight" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="Number" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="Category" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="categoryList"
                :props="cascaderProps"
                @change="handleCategoryChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- Dynamic attributes of this new product -->
          <el-tab-pane label="Dynamic Attributes" name="1">
            <el-form-item
              :label="attribute.attr_name"
              v-for="attribute in dynamicAttributes"
              :key="attribute.attr_id"
            >
              <!-- iterate all the attr_vals of this attribute -->
              <!-- since we have already preprocessed attr_vals, so now it is an array of strings -->
              <el-checkbox-group v-model="attribute.attr_vals">
                <el-checkbox
                  :label="val"
                  v-for="(val, i) in attribute.attr_vals"
                  :key="i"
                  border
                  :checked="false"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- Static attribtues of this new product -->
          <el-tab-pane label="Static Attributes" name="2">
            <el-form-item
              :label="attribute.attr_name"
              v-for="attribute in staticAttributes"
              :key="attribute.attr_id"
            >
              <el-input v-model="attribute.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- Picture upload -->
          <el-tab-pane label="Picture" name="3">
            <!-- action: where to upload this picture, but we need to set headers, add auth token to this request -->
            <el-upload
              :action="uploadURL"
              :headers="headerObj"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :on-success="handlePictureUploadSuccess"
            >
              <el-button size="small" type="primary">Click to upload</el-button>
              <div slot="tip" class="el-upload__tip">
                jpg/png files with a size less than 500kb
              </div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="Content" name="4">
            <quill-editor v-model="addForm.goods_introduce" ref="myQuillEditor">
            </quill-editor>
            <el-button type="primary" class="btnAdd" @click="addProduct"
              >Add New Product</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- Picture preview dialog -->
    <el-dialog title="Preview" :visible.sync="previewDialogVisible" width="50%">
      <img class="previewImg" :src="previewPicURL" alt="" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // controls which step is currently active
      activeStep: 0,
      // data in the add a product form
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        add_time: '',
        goods_cat: [],
        // used to store urls of uploaded pics
        // pic is first uploaded asynly, then server returns the url
        pics: [],
        // description of this new product, it is bond to the rich editor
        goods_introduce: '',
        // store dynamic and static attributes, each attribute has id and value
        attrs: []
      },
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
      },
      // stores all level 1, 2, 3 categories
      categoryList: [],
      // tells cascader what information to retrive from parentCategories
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id', // cat_id will be selected once user clicks an item
        label: 'cat_name', // this is what a user will see in this cascader
        children: 'children'
      },
      // use to store the dynamic attributes of the category of this new product
      dynamicAttributes: [],
      // use to store the static attributes of the category of this new product
      staticAttributes: [],
      // where to store uploaded picture
      uploadURL: 'http://localhost:8888/api/private/v1/upload',
      // add token to Element UI's AJAX request
      headerObj: { Authorization: window.sessionStorage.getItem('token') },
      previewPicURL: '',
      previewDialogVisible: false
    }
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    async getCategoryList() {
      // no need to put any request params
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) {
        return this.$message.error('Obtain Category List Failure')
      }
      // update data object
      this.categoryList = res.data
    },
    // when a user selects a category for the new product
    // note, only level 3 category can be assigned to a product!!!
    handleCategoryChange() {
      if (this.addForm.goods_cat.length !== 3) {
        // so we empty it
        this.addForm.goods_cat = []
      }
    },
    // this method handles tab change event, activeTab is the target tab, oldTab is the tab we are about to leave
    // If a category on basic info tab is not selected, we will not let user go to other tabs
    beforeTabLeave(activeTab, oldTab) {
      if (oldTab === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('Please select a category for this product!')
        return false
      }
    },
    // handles tab click event
    handleTabClick() {
      if (this.activeStep === '1') {
        // if dynamic attribute tab is being clicked, request data
        this.getCategoryAttributes('many')
      } else if (this.activeStep === '2') {
        // static attribute tab
        this.getCategoryAttributes('only')
      }
    },
    // Get all attributes of a given level 3 category
    async getCategoryAttributes(selParam) {
      // the user has selected a level 3 category on basic info tab
      // let's find all the attributes of this category
      const { data: res } = await this.$http.get(
        `categories/${this.catId}/attributes`,
        {
          params: { sel: selParam }
        }
      )
      if (res.meta.status !== 200) {
        this.$message.error('Obtain attributes of a category failure')
      }
      if (selParam === 'many') {
        // we only need to handle for dynamic attributes
        // each attribute has a attr_vals, it is a string of values
        // here, we are converting this string to array of substrings and reassign to attr_vals
        res.data.forEach(item => {
          // the ternary expression is for newly added attribute (since it doesn' have any value yet)
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.dynamicAttributes = res.data
      } else {
        this.staticAttributes = res.data
      }
    },
    // once the picture is uploaded successful, this function will be called
    // we will save the url to add form
    handlePictureUploadSuccess(response) {
      const picture = { pic: response.data.tmp_path }

      this.addForm.pics.push(picture)
    },
    // when user clicks the thumbnail of the uploaded pic
    handlePreview(fileToBeDisplayed) {
      this.previewPicURL = fileToBeDisplayed.response.data.url
      this.previewDialogVisible = true
    },
    // when user removes the picture, we will remove it from server and update the add form
    handleRemove(fileToBeRemoved) {
      const filePath = fileToBeRemoved.response.data.tmp_path // filePath of the file to be removed
      // search for this pic in add form pics
      const index = this.addForm.pics.findIndex(p => p.pic === filePath)
      this.addForm.pics.splice(index, 1)
    },
    addProduct() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // Prepare the JSON object that stores the new product info
        // deep copy the addForm
        // any change made to product will NOT affect addForm
        // we will submit product, not this.addForm
        const product = _.cloneDeep(this.addForm)
        // Convert goods_cat to string
        product.goods_cat = product.goods_cat.join(',')
        console.log(this.dynamicAttributes)
        console.log(this.staticAttributes)
        // prepare attrs based on dynamicAttributes and staticAttributes
        // we don't need to send everything back
        this.dynamicAttributes.forEach(item => {
          const attribute = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(attribute)
        })
        // add static attribtues to attrs
        this.staticAttributes.forEach(item => {
          const attribute = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(attribute)
        })
        product.attrs = this.addForm.attrs
        // use axios to add a product
        const { data: res } = await this.$http.post('/goods', product)
        if (res.meta.status !== 201) this.$message.error('Add Product Error')
        this.$message.success('Add Product Success')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    catId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      } else {
        return null
      }
    }
  }
}
</script>
<style lang="less" scoped>
.el-steps {
  margin: 15px 0;
}
.el-step_title {
  font-size: 13px;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 20px;
}
</style>
