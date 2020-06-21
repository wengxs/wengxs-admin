<template>
  <!-- 导入表 -->
  <el-dialog title="导入表" :visible.sync="visible" width="800px">
    <el-row>
      <el-table v-loading="listLoading" :data="list"
                border highlight-current-row size="mini">
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
import { listSchema, importSchema } from "@/api/gen/code";
export default {
  data() {
    return {
      visible: false,
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
    show() {
      this.visible = true;
      this.getList();
    },
    getList() {
      this.listLoading = true
      listSchema(this.listQuery).then(res => {
        this.list = res.list
        this.total = res.total
        this.listLoading = false
      })
    },
    /** 导入操作 */
    handleImport(row) {
      importSchema(row.name).then(res => {
        this.$message.success('操作成功');
        this.getList()
      });
    }
  }
};
</script>
