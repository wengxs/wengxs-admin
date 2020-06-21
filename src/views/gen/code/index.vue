<template>
  <div class="app-container">
    <el-form :inline="true" :model="listQuery" ref="queryForm" class="filter-container">
      <el-form-item prop="username">
        <el-input size="mini" class="filter-item" v-model="listQuery.username" placeholder="用户名" clearable/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" icon="el-icon-search" @click="handleQuery">查询</el-button>
        <el-button size="mini" icon="el-icon-refresh" @click="resetForm('queryForm')">重置</el-button>
      </el-form-item>
    </el-form>

    <el-button-group class="btn-container">
      <el-button type="primary" size="mini" icon="el-icon-plus" @click="handleAdd"
                 v-permission="['sys:user:add']">添加</el-button>
      <el-button type="success" size="mini" icon="el-icon-edit" @click="handleEdit"
                 v-permission="['sys:user:edit']" :disabled="ids.length !== 1">修改</el-button>
      <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleDel"
                 v-permission="['sys:user:del']" :disabled="ids.length === 0">删除</el-button>
      <!--<el-button type="info" size="mini" icon="el-icon-upload">导入</el-button>
      <el-button type="warning" size="mini" icon="el-icon-download">导出</el-button>-->
    </el-button-group>

    <el-table v-loading="listLoading" :data="list" @selection-change="handleSelectionChange"
              border highlight-current-row size="mini">
      <el-table-column type="selection" align="center" width="40"/>
      <el-table-column label="表名" prop="name" align="center" min-width="140"/>
      <el-table-column label="描述" prop="comment" align="center"/>
      <el-table-column label="实体类" prop="className" align="center" width="140"/>
      <el-table-column label="创建时间" prop="createTime" align="center" width="140"/>
      <el-table-column label="操作" align="center" width="100" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="text" size="mini" @click="handleEdit(row)"
                     v-permission="['gen:code:edit']">修改</el-button>
          <el-button type="text" size="mini" @click="preview(row)"
                     v-permission="['gen:code:edit']">预览</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <!-- 预览面板 -->
    <el-dialog :title="previewDialog.title" :visible.sync="previewDialog.show" width="80%" top="5vh">
      <el-tabs v-model="previewDialog.activeName">
        <el-tab-pane
          v-for="(value, key) in previewDialog.data"
          :label="key.substring(key.lastIndexOf('/')+1,key.indexOf('.vm'))"
          :name="key.substring(key.lastIndexOf('/')+1,key.indexOf('.vm'))"
          :key="key"
        >
          <pre>{{ value }}</pre>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
  import { listTable, getTable, addTable, updateTable, delTable, previewCode } from '@/api/gen/code'
  import { allRole } from '@/api/sys/role'

  export default {
    name: "GenCode",
    data() {
      return {
        ids:[],
        total: 0,
        list: [],
        listLoading: true,
        listQuery: {
          page: 1,
          pageSize: 10,
          sortBy: "createTime",
          sortDirection: "desc"
        },
        roles: [],
        previewDialog: {
          show: false,
          title: '预览',
          activeName: 'entity.java',
          data: {}
        },
        editDialog: {
          show: false,
          title: '修改用户',
          data: {
            id: undefined,
            username: undefined,
            password: undefined,
            enabled: undefined,
            roleIds: []
          },
          rules: {
            password: [
              { required: false, trigger: 'blur' },
              { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
            ],
            roleIds: [
              { type: 'array', required: true, message: '至少选择一个角色', trigger: 'change' }
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
        listTable(this.listQuery).then(res => {
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
        allRole().then(res => {
          this.roles = res.data;
        });
        this.addDialog.show = true;
      },
      handleEdit(row) {
        const id = row.id || this.ids
        getTable(id).then(res => {
          const user = res.data;
          this.editDialog.data.id = id;
          this.editDialog.data.username = user.username;
          this.editDialog.data.enabled = user.enabled;
          this.editDialog.data.roleIds = user.roles.map(role => role.id);
          console.log(this.editDialog.data.roleIds)
          this.editDialog.show = true;
        })
        allRole().then(res => {
          this.roles = res.data;
        })
      },
      handleDel(row) {
        const id = row.id || this.ids;
        this.$confirm('是否确认删除?', '删除').then(() => {
          delTable(id).then(() => {
            this.$message.success('操作成功');
            this.getList();
          });
        });
      },
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.id);
      },
      submitSave() {
        this.$refs['addForm'].validate((valid) => {
          if (valid) {
            addTable(this.addDialog.data).then(() => {
              this.$message.success('添加成功');
              this.addDialog.show = false;
              this.getList();
            })
          }
        });
      },
      submitEdit() {
        this.$refs['editForm'].validate((valid) => {
          if (valid) {
            updateTable(this.editDialog.data).then(() => {
              this.$message.success('修改成功');
              this.editDialog.show = false;
              this.getList()
            })
          }
        });
      },
      preview(row) {
        previewCode(row.id).then(res => {
          this.previewDialog.data = res.data;
          this.previewDialog.show = true;
        })
      }
    }
  }
</script>
