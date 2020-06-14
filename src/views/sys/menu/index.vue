<template>
  <div class="app-container">
    <el-button-group class="btn-container">
      <el-button type="primary" size="mini" icon="el-icon-plus" @click="handleAdd"
                 v-permission="['sys:menu:add']">添加</el-button>
    </el-button-group>
    <el-table v-loading="listLoading" :data="list" row-key="id" :tree-props="{children: 'children'}"
              border size="mini">
      <el-table-column label="菜单名称" prop="name" min-width="100"/>
      <el-table-column label="图标" prop="icon" align="center" width="50">
        <template slot-scope="{row}">
          <svg-icon :icon-class="row.icon" v-if="row.icon != null" />
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" align="center" width="50"/>
      <el-table-column label="URI" prop="path" align="center" width="160"/>
      <el-table-column label="组件路径" prop="component" align="center" width="160"/>
      <el-table-column label="权限标识" prop="permission" align="center" width="160"/>
      <el-table-column label="创建时间" prop="createTime" align="center" width="160"/>
      <el-table-column label="操作" align="center" width="200" fixed="right">
        <template slot-scope="{ row }">
          <el-button type="text" size="mini" @click="handleEdit(row)"
                     v-permission="['sys:menu:edit']">修改</el-button>
          <el-button type="text" size="mini" @click="handleAdd(row)"
                     v-permission="['sys:menu:add']" v-if="row.type===1">新增</el-button>
          <el-button type="text" size="mini" @click="handleDel(row)"
                     v-permission="['sys:menu:del']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加面板 -->
    <el-dialog :title="addDialog.title" :visible.sync="addDialog.show" @close="resetForm('addForm')">
      <div class="dialog-content">
        <el-form :model="addDialog.data" status-icon :rules="addDialog.rules" ref="addForm" label-width="80px">
          <el-form-item label="上级菜单" prop="parentId">
            <!--<el-cascader style="width: 100%"
                         v-model="addDialog.data.parentId"
                         :options="menuTreeOptions"
                         :props="{ checkStrictly: true, value: 'id', label: 'name', children: 'children', emitPath: false }"
                         clearable>
            </el-cascader>-->
            <treeselect
              v-model="addDialog.data.parentId"
              :options="menuTreeOptions"
              :normalizer="normalizer"
              :show-count="true"
              placeholder="上级菜单"
            />
          </el-form-item>
          <el-form-item label="菜单类型" prop="type">
            <el-radio-group v-model="addDialog.data.type">
              <el-radio :label="1">目录</el-radio>
              <el-radio :label="2">按钮</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="图标" prop="icon" v-if="addDialog.data.type === 1">
            <el-popover
              placement="bottom-start"
              width="460"
              trigger="click"
              @show="$refs['iconSelect'].reset()"
            >
              <IconSelect ref="iconSelect" @selected="(name) => {addDialog.data.icon = name}" />
              <el-input slot="reference" v-model="addDialog.data.icon" placeholder="点击选择图标" readonly>
                <svg-icon
                  v-if="addDialog.data.icon"
                  slot="prefix"
                  :icon-class="addDialog.data.icon"
                  class="el-input__icon"
                  style="height: 32px;width: 16px;"
                />
                <i v-else slot="prefix" class="el-icon-search el-input__icon" />
              </el-input>
            </el-popover>
          </el-form-item>
          <el-form-item label="菜单名称" prop="name">
            <el-input v-model="addDialog.data.name" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="路由地址" prop="path" v-if="addDialog.data.type === 1">
            <el-input v-model="addDialog.data.path" autocomplete="off" placeholder="如：/sys/menu"></el-input>
          </el-form-item>
          <el-form-item label="组件" prop="component" v-if="addDialog.data.type === 1">
            <el-input v-model="addDialog.data.component" autocomplete="off" placeholder="如：sys/menu"></el-input>
          </el-form-item>
          <el-form-item label="权限" prop="permission">
            <el-input v-model="addDialog.data.permission" autocomplete="off" placeholder="格式：xxx:xxx:xxx"></el-input>
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="addDialog.data.sort" autocomplete="off" :min="0"/>
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
          <el-form-item label="上级菜单" prop="parentId">
            <!--<el-cascader style="width: 100%"
                         v-model="editDialog.data.parentId"
                         :options="menuTreeOptions"
                         :props="{ checkStrictly: true, value: 'id', label: 'name', children: 'children', emitPath: false }"
                         clearable>
            </el-cascader>-->
            <treeselect
              v-model="editDialog.data.parentId"
              :options="menuTreeOptions"
              :normalizer="normalizer"
              :show-count="true"
              placeholder="上级菜单"
            />
          </el-form-item>
          <el-form-item label="菜单类型" prop="type">
            <el-radio-group v-model="editDialog.data.type">
              <el-radio :label="1">目录</el-radio>
              <el-radio :label="2">按钮</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="图标" prop="icon" v-if="editDialog.data.type === 1">
            <el-popover
              placement="bottom-start"
              width="460"
              trigger="click"
              @show="$refs['iconSelect'].reset()"
            >
              <IconSelect ref="iconSelect" @selected="(name) => {editDialog.data.icon = name}" />
              <el-input slot="reference" v-model="editDialog.data.icon" placeholder="点击选择图标" readonly>
                <svg-icon
                  v-if="editDialog.data.icon"
                  slot="prefix"
                  :icon-class="editDialog.data.icon"
                  class="el-input__icon"
                  style="height: 32px;width: 16px;"
                />
                <i v-else slot="prefix" class="el-icon-search el-input__icon" />
              </el-input>
            </el-popover>
          </el-form-item>
          <el-form-item label="菜单名称" prop="name">
            <el-input v-model="editDialog.data.name" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="路由地址" prop="path" v-if="editDialog.data.type === 1">
            <el-input v-model="editDialog.data.path" autocomplete="off" placeholder="如：/sys/menu"></el-input>
          </el-form-item>
          <el-form-item label="组件" prop="component" v-if="editDialog.data.type === 1">
            <el-input v-model="editDialog.data.component" autocomplete="off" placeholder="如：sys/menu"></el-input>
          </el-form-item>
          <el-form-item label="权限" prop="permission">
            <el-input v-model="editDialog.data.permission" autocomplete="off" placeholder="格式：xxx:xxx:xxx"></el-input>
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="editDialog.data.sort" autocomplete="off" :min="0"/>
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
  import { listMenuTree, treeRouter, getMenu, addMenu, updateMenu, delMenu } from '@/api/sys/menu'
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import IconSelect from "@/components/IconSelect";

  export default {
    name: "SysMenu",
    components: { Treeselect, IconSelect },
    data() {
      return {
        ids:[],
        total: 0,
        list: [],
        listLoading: true,
        menuTreeOptions: [],
        addDialog: {
          show: false,
          title: '添加菜单',
          data: {
            parentId: 0,
            name: undefined,
            path: undefined,
            component: undefined,
            type: 1,
            permission: undefined,
            icon: undefined,
            sort: 0
          },
          rules: {
            name: [
              { required: true, message: '请输入菜单名称', trigger: 'blur' },
              { min: 2, message: '长度不能少于2个字符', trigger: 'blur' }
            ]
          }
        },
        editDialog: {
          show: false,
          title: '修改菜单',
          data: {
            id: undefined,
            parentId: undefined,
            name: undefined,
            path: undefined,
            component: undefined,
            type: undefined,
            permission: undefined,
            icon: undefined,
            sort: undefined
          },
          rules: {
            name: [
              { required: true, message: '请输入菜单名称', trigger: 'blur' },
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
        listMenuTree().then(res => {
          this.list = res.data
          this.listLoading = false
        })
      },
      handleAdd(row) {
        this.menuTreeOptions = [];
        treeRouter().then(res => {
          const menu = { id: 0, name: '首页', children: [] };
          menu.children = res.data;
          this.menuTreeOptions.push(menu);
          this.addDialog.data.parentId = row.id || 0
        });
        this.addDialog.show = true;
      },
      handleEdit(row) {
        const _this = this;
        getMenu(row.id).then(res => {
          _this.editDialog.data = res.data;
          _this.menuTreeOptions = [];
          treeRouter().then(res2 => {
            const menu = { id: 0, name: '首页', children: [] };
            menu.children = res2.data;
            _this.menuTreeOptions.push(menu);
          });
          _this.editDialog.show = true;
        })
      },
      handleDel(row) {
        this.$confirm('是否确认删除?', '删除').then(() => {
          delMenu(row.id).then(() => {
            this.$message.success('操作成功');
            this.getList();
          });
        });
      },
      submitSave() {
        const _this = this;
        this.$refs['addForm'].validate((valid) => {
          if (valid) {
            addMenu(_this.addDialog.data).then(() => {
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
            updateMenu(this.editDialog.data).then(() => {
              this.$message.success('修改成功');
              this.editDialog.show = false;
              this.getList()
            })
          }
        });
      },
      normalizer(node) {
        if (node.children && !node.children.length) {
          delete node.children;
        }
        return {
          id: node.id,
          label: node.name,
          children: node.children
        };
      },
    }
  }
</script>
