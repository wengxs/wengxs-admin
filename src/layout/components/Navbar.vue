<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <search id="header-search" class="right-menu-item" />

        <error-log class="errLog-container right-menu-item hover-effect" />

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <!--<el-tooltip content="Global Size" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>-->

      </template>

      <el-dropdown class="right-menu-item hover-effect" trigger="click">
        <div>
          {{ username }}
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <!--<router-link to="/profile/index">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>-->
          <el-dropdown-item @click.native="openChangePassword = true">
            <span>修改密码</span>
          </el-dropdown-item>
          <el-dropdown-item @click.native="setting = true">
            <span>布局设置</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <el-dialog title="修改密码" :visible.sync="openChangePassword" @close="resetForm('editForm')"
               :modal-append-to-body="false" :close-on-click-modal="false">
      <div class="dialog-content">
        <el-form :model="changePasswordForm" status-icon :rules="changePasswordRules" ref="editForm" label-width="80px">
          <el-form-item label="当前密码" prop="oldPassword">
            <el-input type="password" v-model="changePasswordForm.oldPassword" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="新的密码" prop="newPassword">
            <el-input type="password" v-model="changePasswordForm.newPassword" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="rePassword">
            <el-input type="password" v-model="changePasswordForm.rePassword" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitChangePassword">提交</el-button>
            <el-button @click="openChangePassword = false">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import ErrorLog from '@/components/ErrorLog'
import Screenfull from '@/components/Screenfull'
// import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import { changePassword } from '@/api/base'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    Screenfull,
    // SizeSelect,
    Search
  },
  data() {
    return {
      openChangePassword: false,
      changePasswordForm: {
        oldPassword: undefined,
        newPassword: undefined,
        rePassword: undefined,
      },
      changePasswordRules: {
        oldPassword: [
          { required: true, message: '请输入当前密码', trigger: 'blur' },
        ],
        newPassword: [
          { required: true, message: '请输入新的密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
        ],
        rePassword: [
          { required: true,
            validator: (rule, value, callback) => {
              if (value !== this.changePasswordForm.newPassword){
                return callback(new Error());
              }
              return callback();
            },
            message: '两次输入密码不一致',
            trigger: 'blur'
          }
        ],
      }
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'username',
      'device'
    ]),
    setting: {
      get() {
        return this.$store.state.settings.showSettings
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        })
      }
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    logout() {
      this.$confirm('确定注销并退出系统吗？', '提示').then(() => {
        this.$store.dispatch('user/logout').then(() => {
          this.$router.push(`/login?redirect=${this.$route.fullPath}`)
        })
      })
    },
    submitChangePassword() {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          changePassword(this.changePasswordForm).then(() => {
            this.$message.success('修改成功');
            this.openChangePassword = false;
          })
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
