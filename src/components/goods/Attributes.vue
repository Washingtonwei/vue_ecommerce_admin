<template>
  <div>
    <!-- Breadcrumb -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>Goods Management</el-breadcrumb-item>
      <el-breadcrumb-item>Category Attributes</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- main area -->
    <el-card class="box-card">
      <!-- Warning message -->
      <el-alert
        title="Reminder: You can only set attributes for level 3 categories"
        type="warning"
        show-icon
        :closable="false"
      ></el-alert>
      <!-- Select a category cascader -->
      <el-row class="cat_opt">
        <el-col>
          <span>Select a level 3 category: </span>
          <el-cascader
            v-model="selectedCategories"
            :options="categoryList"
            :props="cascaderProps"
            @change="handleCategoryChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- Two Tabs, one for setting dynamic attribute, the other for setting static attribute -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- tab-pane for dynamic attributes of this selected category -->
        <!-- in the backend, "many" means dynamic attribute  -->
        <el-tab-pane label="Dynamic Attributes" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >Add Dynamic Attribute</el-button
          >
          <!-- Table to display dynamic attributes -->
          <el-table :data="dynamicAttributes" border stripe>
            <!-- Expand column, clicking this will show all the values this attribute currently has -->
            <!-- User can add more or remove them -->
            <el-table-column type="expand">
              <!-- scoped slot is used here -->
              <template v-slot="scope">
                <!-- iterate all the attr_vals of this attribute -->
                <!-- since we have already preprocessed attr_vals, so now it is an array of strings -->
                <el-tag
                  v-for="(val, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleTagClose(scope.row, i)"
                >
                  {{ val }}
                </el-tag>
                <!-- followed by an editable tag -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="mini"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Value</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column label="Name" prop="attr_name"></el-table-column>
            <el-table-column label="Operations" width="180px">
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
                  @click="deleteById(scope.row.attr_id)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- tab-pane for static attributes of this selected category -->
        <!-- in the backend, "only" means static attribute -->
        <el-tab-pane label="Static Attributes" name="only"
          ><el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >Add Static Attribute</el-button
          >
          <!-- Table to display static attribute -->
          <el-table :data="staticAttributes" border stripe>
            <el-table-column type="expand">
              <!-- scoped slot is used here -->
              <template v-slot="scope">
                <!-- iterate all the attr_vals of this attribute -->
                <!-- since we have already preprocessed attr_vals, so now it is an array of strings -->
                <el-tag
                  v-for="(val, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleTagClose(scope.row, i)"
                >
                  {{ val }}
                </el-tag>
                <!-- followed by an editable tag -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="mini"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Value</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column label="Name" prop="attr_name"></el-table-column>
            <el-table-column label="Operations" width="180px">
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
                  @click="deleteById(scope.row.attr_id)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- add a dynamic attribute or static attribute dialog, the name of the dialog depends on the computed property addTitlText -->
    <el-dialog
      :title="'Add a ' + addTitleText"
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
        <el-form-item :label="addTitleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addAttribute">Add</el-button>
      </span>
    </el-dialog>
    <!-- edit an attribute dialog -->
    <el-dialog
      title="Edit an attribute"
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
        <el-form-item label="Attribute name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="updateAttribute(editForm.attr_id)"
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
      // stores all level 1, 2, 3 categories
      categoryList: [],
      // tells cascader what information to retrive from parentCategories
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id', // cat_id will be selected once user clicks an item
        label: 'cat_name', // this is what a user will see in this cascader
        children: 'children'
      },
      // used to store user's selection of categories
      selectedCategories: [],
      // active tab name, either many or only, this tell us which kind of attribute we are deal with, useful when we update or delete
      activeName: 'many',
      // used to store dynamic attributes of this selected category
      dynamicAttributes: [],
      // used to store static attributes of this selected category
      staticAttributes: [],
      addDialogVisible: false,
      addForm: {},
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: 'Please input attribute name',
            trigger: 'blur'
          }
        ]
      },
      editDialogVisible: false,
      editForm: {}
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
    // when a user selects a parent category for the new category to be added
    handleCategoryChange() {
      this.getCategoryAttributes()
    },
    // handle tab click event
    handleTabClick() {
      this.getCategoryAttributes()
    },
    // Get all attributes of a given level 3 category
    async getCategoryAttributes() {
      // We are only interested in level 3, so if the length of the selectedCategories is not 3
      // the user may only select level 1 or level 2 categories
      if (this.selectedCategories.length !== 3) {
        // so we empty selectedCategories
        this.selectedCategories = []
        // we also need to empty the table, it is possible the user first selected a level 3 category,
        // then select a level 2, we need to empty the table
        this.dynamicAttributes = this.staticAttributes = []
      } else {
        // the user has selected a level 3 category
        // let's find all the attributes of this category
        const { data: res } = await this.$http.get(
          `categories/${this.catId}/attributes`,
          {
            params: { sel: this.activeName }
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error('Obtain attributes of a category failure')
        }
        // each attribute has a attr_vals, it is a string of values
        // here, we are converting this string to array of substrings and reassign to attr_vals
        res.data.forEach(item => {
          // the ternary expression is for newly added attribute (since it doesn' have any value yet)
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          // here we will do a little extra, each attribute has two new properties
          // inputVisible controls the visibility of the "+ New Value" input box
          item.inputVisible = false
          // inputValue stores the new val of this attribute
          item.inputValue = ''
        })
        // once we got the returned data, we put it in the right place
        if (this.activeName === 'many') {
          this.dynamicAttributes = res.data
        } else {
          this.staticAttributes = res.data
        }
      }
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    addAttribute() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // use axios to add an attribute
        const { data: res } = await this.$http.post(
          `categories/${this.catId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        // be careful, success is 201 in this case
        if (res.meta.status !== 201) this.$message.error('Add Attribute Error')
        console.log(res.meta.msg)
        this.$message.success('Add Attribute Success')
        // hide add role dialog
        this.addDialogVisible = false
        // get the latest data
        this.getCategoryAttributes()
      })
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    async showEditDialog(attributeInfo) {
      // prepare data for edit form, find attribute by cat_id and attr_id
      const { data: res } = await this.$http.get(
        `categories/${this.catId}/attributes/${attributeInfo.attr_id}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        this.$message.error('Find an Attribute Error')
      }
      // populate the edit form
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // id is the id of the attribute
    updateAttribute(id) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // use axios to update this attribute
        const { data: res } = await this.$http.put(
          `categories/${this.catId}/attributes/${id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('Update a Attribute Error')
        }
        this.$message.success('Update a Attribute Success')
        this.editDialogVisible = false
        // get the latest data
        this.getCategoryAttributes()
      })
    },
    // id is the id of the attribute
    async deleteById(id) {
      // ask if you really want to delete this attribute
      this.$confirm(
        'This will permanently delete this attribute. Continue?',
        'Warning',
        {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      )
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `categories/${this.catId}/attributes/${id}`
          )
          if (res.meta.status !== 200) {
            this.$message.error('Delete an Attribute Error')
          }
          this.$message.success('Delete an Attribute Success')
          // get the latest data
          this.getCategoryAttributes()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: 'Delete canceled'
          })
        })
    },
    // the following methods are related to attr_vals tags
    // When user clicks the "cross" symbol on a tag,remove a val from attr_vals
    handleTagClose(attributeInfo, index) {
      // remove it from the view model, so we can see it is gone on the page
      attributeInfo.attr_vals.splice(index, 1)
      // delete from the backend
      this.updateAttributeValue(attributeInfo)
    },
    // show input box
    showInput(attributeInfo) {
      attributeInfo.inputVisible = true
      // when you change inputVisible to true, the page is not rendered immediately,
      // we need to wait until the page gets rerendered and then get the focus
      // obtain input focus
      // $nextTick is called when page is rerendered, that is the moment we get focus
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // save the new val to attr_vals of this attribute
    handleInputConfirm(attributeInfo) {
      // if the input is valid: not just spaces or tabs
      if (attributeInfo.inputValue.trim().length !== 0) {
        const inputValue = attributeInfo.inputValue
        if (inputValue) {
          // update attr_vals array, note, this will affect the view (we can see the effect of a new val being added),
          // but we haven't persisted the change!
          attributeInfo.attr_vals.push(inputValue.trim())
          // save to backend (PUT request)
          this.updateAttributeValue(attributeInfo)
        }
      }
      // reset input box
      attributeInfo.inputVisible = false
      attributeInfo.inputValue = ''
    },
    // this update only updates attr_vals, attr_name is not changed
    // the argument attributeInfo has a property attr_vals, however, it is array
    // before we send PUT request, we need to convert array to space separated strings
    async updateAttributeValue(attributeInfo) {
      // use axios to update this attribute
      const { data: res } = await this.$http.put(
        `categories/${this.catId}/attributes/${attributeInfo.attr_id}`,
        {
          attr_name: attributeInfo.attr_name,
          attr_sel: this.activeName,
          attr_vals: attributeInfo.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        // if fail, we need to make sure the page stays the same, so we delete the newly added attr val
        attributeInfo.attr_vals.pop()
        return this.$message.error('Update failure')
      }
      this.$message.success('Update Success')
    }
  },
  computed: {
    // This computed property controls the add attribute button
    // if user clicks level 3 category, return true
    // otherwise, return false
    isBtnDisabled() {
      return this.selectedCategories.length !== 3
    },
    // the selected category id in cascader, this is the id of a level 3 category
    catId() {
      if (this.selectedCategories.length === 3) {
        return this.selectedCategories[2]
      }
      return null
    },
    // this computed property is used in add attribute form dialog
    // we can use this to determine which title to show
    addTitleText() {
      return this.activeName === 'many'
        ? 'Dynamic attribute'
        : 'Static attribute'
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 90px;
}
.button-new-tag {
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
