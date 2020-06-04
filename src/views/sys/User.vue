<template>
  <div class="app-container">
    <div class="filter-container">
      <el-form :model="listQuery" ref="listQuery" :inline="true" label-width="68px">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="listQuery.username"
            placeholder="用户名"
            clearable
            size="small"
            style="width: 240px"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
  </div>
</template>

<script>
  import { listUser } from '@/api/sys/user'
  import Pagination from '@/components/Pagination'

  export default {
    components: { Pagination },
    data() {
      return {
        total: 0,
        list: [],
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 20,
          sortBy: "createTime",
          sortDirection: "desc"
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        listUser(this.listQuery).then(response => {
          this.list = response.data.list
          this.total = response.data.total
          this.listLoading = false
        })
      },
      handleQuery() {
        this.listQuery.page = 1;
        this.getList();
      },
    }
  }
</script>

<style scoped>


</style>
