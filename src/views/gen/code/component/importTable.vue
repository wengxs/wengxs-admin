<template>
  <!-- 导入表 -->
  <el-dialog title="导入表" :visible.sync="visible" width="800px" top="5vh">
    <el-row>
      <el-table v-loading="listLoading" :data="list" @selection-change="handleSelectionChange"
                border highlight-current-row size="mini">
        <el-table-column type="selection" align="center" width="40"/>
        <el-table-column label="表名" prop="name" align="center" min-width="140"/>
        <el-table-column label="描述" prop="comment" align="center"/>
        <el-table-column label="创建时间" prop="createTime" align="center" width="140"/>
        <el-table-column label="操作" align="center" width="100" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click="handleImport(row)"
                       v-permission="['gen:code:import']">导入</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="getList" />
    </el-row>
  </el-dialog>
</template>

<script>
import { listDbTable, importTable } from "@/api/gen/code";
export default {
  data() {
    return {
      total: 0,
      list: [],
      listLoading: true,
      listQuery: {
        page: 1,
        pageSize: 10
      },
    };
  },
  methods: {
    // 显示弹框
    show() {
      this.getList();
      this.visible = true;
    },
    clickRow(row) {
      this.$refs.table.toggleRowSelection(row);
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.tables = selection.map(item => item.tableName);
    },
    // 查询表数据
    getList() {
      listDbTable(this.queryParams).then(res => {
        if (res.code === 200) {
          this.dbTableList = res.rows;
          this.total = res.total;
        }
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 导入按钮操作 */
    handleImportTable() {
      importTable({ tables: this.tables.join(",") }).then(res => {
        this.msgSuccess(res.msg);
        if (res.code === 200) {
          this.visible = false;
          this.$emit("ok");
        }
      });
    }
  }
};
</script>
