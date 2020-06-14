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
      <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleAdd"
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
      <el-table-column label="用户名" prop="username" align="center" min-width="100"/>
      <el-table-column label="状态" prop="enabled" align="center" width="100">
        <template slot-scope="{ row }">
          <el-tag size="mini" :type="row.enabled ? 'success' : ''">
            {{ row.enabled ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="createBy" align="center" width="140"/>
      <el-table-column label="创建时间" prop="createTime" align="center" width="140"/>
      <el-table-column label="操作" align="center" width="100" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="text" size="mini" icon="el-icon-edit" @click="handleEdit(row)"
                     v-permission="['sys:user:edit']">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <!-- 添加面板 -->
    <el-dialog :title="addDialog.title" :visible.sync="addDialog.show" @close="resetForm('addForm')">
      <div class="dialog-content">
        <el-form :model="addDialog.data" status-icon :rules="addDialog.rules" ref="addForm" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addDialog.data.username" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="addDialog.data.password" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="启用">
            <el-switch
              v-model="addDialog.data.enabled"
              active-color="#13ce66">
            </el-switch>
          </el-form-item>
          <el-form-item label="角色" prop="roleIds">
            <el-checkbox-group v-model="addDialog.data.roleIds">
              <el-checkbox v-for="item in roles" :key="item.id" :label="item.id" name="roleIds">{{ item.description }}</el-checkbox>
            </el-checkbox-group>
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
          <el-form-item label="用户名">
            <el-input v-model="editDialog.data.username" autocomplete="off" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="editDialog.data.password" autocomplete="off" placeholder="不输入则不修改密码"></el-input>
          </el-form-item>
          <el-form-item label="启用">
            <el-switch
              v-model="editDialog.data.enabled"
              active-color="#13ce66">
            </el-switch>
          </el-form-item>
          <el-form-item label="角色" prop="roleIds">
            <el-checkbox-group v-model="editDialog.data.roleIds">
              <el-checkbox v-for="item in roles" :key="item.id" :label="item.id" name="roleIds">{{ item.description }}</el-checkbox>
            </el-checkbox-group>
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
  import { listUser, getUser, addUser, updateUser, delUser } from '@/api/sys/user'
  import { allRole } from '@/api/sys/role'

  export default {
    name: "SysUser",
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
        addDialog: {
          show: false,
          title: '添加用户',
          data: {
            username: undefined,
            password: undefined,
            enabled: true,
            roleIds: []
          },
          rules: {
            username: [
              { required: true, message: '请输入用户名', trigger: 'blur' },
              { min: 2, message: '用户名长度不能少于2个字符', trigger: 'blur' }
            ],
            password: [
              { required: true, message: '请输入密码', trigger: 'blur' },
              { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
            ],
            roleIds: [
              { type: 'array', required: true, message: '至少选择一个角色', trigger: 'change' }
            ]
          }
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
        listUser(this.listQuery).then(res => {
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
        getUser(id).then(res => {
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
          delUser(id).then(() => {
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
            addUser(this.addDialog.data).then(() => {
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
            updateUser(this.editDialog.data).then(() => {
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
