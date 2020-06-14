<template>
  <div class="app-container">
    <el-form :inline="true" :model="listQuery" ref="queryForm" class="filter-container">
      <el-form-item prop="description">
        <el-input size="mini" class="filter-item" v-model="listQuery.description" placeholder="角色名称" clearable/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button size="mini" icon="el-icon-refresh" @click="resetForm('queryForm')">重置</el-button>
      </el-form-item>
    </el-form>

    <el-button-group class="btn-container">
      <el-button type="primary" size="mini" icon="el-icon-plus" @click="handleAdd"
                 v-permission="['sys:role:add']">添加</el-button>
      <el-button type="success" size="mini" icon="el-icon-edit" @click="handleEdit"
                 v-permission="['sys:role:edit']" :disabled="ids.length !== 1">修改</el-button>
      <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDel"
                 v-permission="['sys:role:del']" :disabled="ids.length === 0">删除</el-button>
    </el-button-group>

    <el-table v-loading="listLoading" :data="list" @selection-change="handleSelectionChange"
              border highlight-current-row size="mini">
      <el-table-column type="selection" align="center" width="40"/>
      <el-table-column label="角色名称" prop="description" align="center" min-width="100"/>
      <el-table-column label="角色标识" prop="name" align="center" width="100"/>
      <el-table-column label="创建时间" prop="createTime" align="center" width="140"/>
      <el-table-column label="操作" align="center" width="100" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="text" size="mini" @click="handleEdit(row)"
                     v-permission="['sys:role:edit']">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <!-- 添加面板 -->
    <el-dialog :title="addDialog.title" :visible.sync="addDialog.show" @close="resetForm('addForm')">
      <div class="dialog-content">
        <el-form :model="addDialog.data" status-icon :rules="addDialog.rules" ref="addForm" label-width="80px">
          <el-form-item label="角色名称" prop="description">
            <el-input v-model="addDialog.data.description" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="角色标识" prop="name">
            <el-input v-model="addDialog.data.name" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="权限" prop="permissions">
            <el-tree
              :data="menuTree"
              ref="addTree"
              show-checkbox
              node-key="id"
              empty-text="加载中，请稍后"
              :props="{children: 'children', label: 'name'}">
            </el-tree>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitSave">提交</el-button>
            <el-button @click="addDialog.show = false">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>

    <!--  编辑面板 -->
    <el-dialog :title="editDialog.title" :visible.sync="editDialog.show" @close="resetForm('editForm')">
      <div class="dialog-content">
        <el-form :model="editDialog.data" status-icon :rules="editDialog.rules" ref="editForm" label-width="80px">
          <el-form-item label="角色名称" prop="description">
            <el-input v-model="editDialog.data.description" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="角色标识" prop="name">
            <el-input v-model="editDialog.data.name" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="权限" prop="permissions">
            <el-tree
              :data="menuTree"
              ref="editTree"
              show-checkbox
              node-key="id"
              empty-text="加载中，请稍后"
              :props="{children: 'children', label: 'name'}">
            </el-tree>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitEdit">提交</el-button>
            <el-button @click="editDialog.show = false">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { listRole, getRole, addRole, updateRole, delRole } from '@/api/sys/role'
  import { treeMenu } from '@/api/sys/menu'

  export default {
    name: "SysRole",
    data() {
      return {
        ids:[],
        total: 0,
        list: [],
        listLoading: true,
        listQuery: {
          page: 1,
          pageSize: 10,
          sortBy: "id",
          sortDirection: "asc"
        },
        menuTree: [],
        addDialog: {
          show: false,
          title: '添加角色',
          data: {
            description: undefined,
            name: undefined,
            menuIds: []
          },
          rules: {
            description: [
              { required: true, message: '请输入角色名称', trigger: 'blur' },
              { min: 2, message: '长度不能少于2个字符', trigger: 'blur' }
            ],
            name: [
              { required: true, message: '请输入角色标识', trigger: 'blur' },
              { min: 2, message: '长度不能少于2个字符', trigger: 'blur' }
            ]
          }
        },
        editDialog: {
          show: false,
          title: '修改角色',
          data: {
            id: undefined,
            description: undefined,
            name: undefined,
            menuIds: []
          },
          rules: {
            description: [
              { required: true, message: '请输入角色名称', trigger: 'blur' },
              { min: 2, message: '长度不能少于2个字符', trigger: 'blur' }
            ],
            name: [
              { required: true, message: '请输入角色标识', trigger: 'blur' },
              { min: 2, message: '长度不能少于2个字符', trigger: 'blur' }
            ]
          }
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        listRole(this.listQuery).then(res => {
          this.list = res.list
          this.total = res.total
          this.listLoading = false
        })
      },
      handleQuery() {
        this.listQuery.page = 1;
        this.getList();
      },
      handleAdd() {
        treeMenu().then(res => {
          this.menuTree = res.data;
        });
        this.addDialog.show = true;
      },
      handleEdit(row) {
        const id = row.id || this.ids
        getRole(id).then(res => {
          const { data } = res;
          this.editDialog.data.id = id;
          this.editDialog.data.description = data.description;
          this.editDialog.data.name = data.name;
          treeMenu().then(res => {
            this.menuTree = res.data;
            this.$refs.editTree.setCheckedKeys(data.permissionIds);
          });
          this.editDialog.show = true;
        })
      },
      handleDel(row) {
        const ids = row.id || this.ids;
        this.$confirm('是否确认删除?', '删除').then(() => {
          delRole(ids).then(() => {
            this.$message.success('操作成功');
            this.getList();
          });
        });
      },
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.id);
      },
      submitSave() {
        const _this = this;
        this.$refs['addForm'].validate((valid) => {
          if (valid) {
            let parentKeys = _this.$refs.addTree.getHalfCheckedKeys();   //获取半选中状态的id
            let childKeys = _this.$refs.addTree.getCheckedKeys();  //获取全选中的id
            _this.addDialog.data.menuIds = parentKeys.concat(childKeys);   //拼接在一起
            addRole(_this.addDialog.data).then(() => {
              _this.$message.success('添加成功');
              _this.addDialog.show = false;
              _this.getList();
            })
          }
        });
      },
      submitEdit() {
        this.$refs['editForm'].validate((valid) => {
          if (valid) {
            let parentKeys = this.$refs.editTree.getHalfCheckedKeys();   //获取半选中状态的id
            let childKeys = this.$refs.editTree.getCheckedKeys();  //获取全选中的id
            this.editDialog.data.menuIds = parentKeys.concat(childKeys);   //拼接在一起
            updateRole(this.editDialog.data).then(() => {
              this.$message.success('修改成功');
              this.editDialog.show = false;
              this.getList()
            })
          }
        });
      }
    }
  }
</script>
