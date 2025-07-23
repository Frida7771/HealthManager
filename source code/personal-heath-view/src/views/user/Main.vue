<template>
    <div class="user-container">
        <div class="menus-container"
            style="position: sticky;top: 0;z-index: 1000;background-color: rgb(255, 255, 255);">
            <!-- 菜单目录 -->
            <UserMenu :menus="routers" :userInfo="userInfo" @eventListener="eventListener" />
        </div>
        <div class="content-container">
            <!-- 路由出口 -->
            <router-view class="route-container"></router-view>
        </div>
        <!-- 个人中心弹窗 -->
        <el-dialog :show-close="false" :visible.sync="dialogOperaion" width="30%">
            <div slot="title" style="padding: 25px 0 0 20px;">
                <span style="font-size: 18px;font-weight: 800;">personal center</span>
            </div>
            <el-row style="padding: 10px 20px 20px 20px;">
                <el-row>
                    <p style="font-size: 12px;padding: 3px 0;margin-bottom: 10px;">
                        <span class="modelName">*avatar</span>
                    </p>
                    <el-upload class="avatar-uploader" action="/api/personal-heath/v1.0/file/upload"
                        :show-file-list="false" :on-success="handleAvatarSuccess">
                        <img v-if="data.url" :src="data.url" class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                </el-row>
                <el-row>
                    <p style="font-size: 12px;padding: 3px 0;">
                        <span class="modelName">*user name</span>
                    </p>
                    <input class="modelInput" type="text" v-model="data.name" placeholder="user name">
                </el-row>
                <el-row>
                    <p style="font-size: 12px;padding: 3px 0;">
                        <span class="modelName">*personal email</span>
                    </p>
                    <input class="modelInput" type="text" v-model="data.email" placeholder="user name">
                </el-row>
            </el-row>
            <span slot="footer" class="dialog-footer">
                
                <el-button class="customer" size="small" style="background-color: rgb(241, 241, 241);border: none;"
                    @click="dialogOperaion = false">cancel</el-button>
                <el-button size="small" style="background-color: #15559a;border: none;" class="customer" type="info"
                    @click="updateUserInfo">modify</el-button>
            </span>
        </el-dialog>
        <!-- 重置密码 -->
        <el-dialog :show-close="false" :visible.sync="dialogRetPwdOperaion" width="26%">
            <div slot="title" style="padding: 25px 0 0 20px;">
                <span style="font-size: 18px;font-weight: 800;">reset password</span>
            </div>
            <el-row style="padding: 10px 20px 20px 20px;">
                <el-row>
                    <p style="font-size: 12px;padding: 3px 0;margin-bottom: 10px;">
                        <span class="modelName">*original password</span>
                    </p>
                    <input class="modelInput" type="password" v-model="pwdEntity.oldPwd" placeholder="original password">
                </el-row>
                <el-row>
                    <p style="font-size: 12px;padding: 3px 0;margin-bottom: 10px;">
                        <span class="modelName">*new password</span>
                    </p>
                    <input class="modelInput" type="password" v-model="pwdEntity.newPwd" placeholder="new password">
                </el-row>
                <el-row>
                    <p style="font-size: 12px;padding: 3px 0;margin-bottom: 10px;">
                        <span class="modelName">*confirm password</span>
                    </p>
                    <input class="modelInput" type="password" v-model="pwdEntity.againPwd" placeholder="confirm password">
                </el-row>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button class="customer" size="small" style="background-color: rgb(241, 241, 241);border: none;"
                    @click="dialogRetPwdOperaion = false">cancel</el-button>
                <el-button size="small" style="background-color: #15559a;border: none;" class="customer" type="info"
                    @click="updateUserPwd">modify</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import { clearToken } from "@/utils/storage.js";
import router from "@/router";
import UserMenu from '@/components/LevelMenu.vue';
export default {
    name: "UserMain",
    components: {
        UserMenu
    },
    data() {
        return {
            userInfo: {},
            data: {},
            pwdEntity: { oldPwd: '', newPwd: '', againPwd: '' },
            dialogOperaion: false,
            dialogRetPwdOperaion: false,
            foodList: [],
            routers: [],
            isCheckFood: [],
            isCheckHealthModelConfig: [],
            healthModelConfig: [],
            selecedFoodIndex: 0,
            selecedHealthModelIndex: 0,
            dietDialog: false,
            healthModelConfigDialog: false
        };
    },
    created() {
        this.tokenCheckLoad();
    },
    methods: {
        healthModelChange() {
            const healthModel = this.healthModelConfig[this.selecedHealthModelIndex - 2];
            const exists = this.isCheckHealthModelConfig.some(item => item.id === healthModel.id);
            // 如果不存在，则添加新选的健康配置项
            if (!exists) {
                this.isCheckHealthModelConfig.unshift(healthModel);
            } else {
                console.log("指标项已经添加");
            }
        },
        updateUserPwd() {
            this.resetPwd();
        },
        async updateUserInfo() {
            try {
                const userUpdateDTO = {
                    userAvatar: this.data.url,
                    userName: this.data.name,
                    userEmail: this.data.email
                }
                const resposne = await this.$axios.put(`/user/update`, userUpdateDTO);
                const { data } = resposne;
                if (data.code === 200) {
                    this.dialogOperaion = false;
                    this.tokenCheckLoad();
                    this.$swal.fire({
                        title: 'modify personal info',
                        text: data.msg,
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1000,
                    });
                }
            } catch (e) {
                this.dialogOperaion = false;
                this.$swal.fire({
                    title: 'modify personal info exception',
                    text: e,
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 2000,
                });
                console.error(`modify personal info exception:${e}`);
            }
        },
        async resetPwd() {
            try {
                const { oldPwd, newPwd, againPwd } = this.pwdEntity;
                if (!oldPwd || !newPwd || !againPwd) {
                    this.$message(`any item cannot be empty`);
                    return;
                }
                if (newPwd !== againPwd) {
                    this.$message(`password input inconsistent`);
                    return;
                }
                const pwdDTO = {
                    oldPwd: this.$md5(this.$md5(oldPwd)),
                    newPwd: this.$md5(this.$md5(newPwd))
                }
                const resposne = await this.$axios.put(`/user/updatePwd`, pwdDTO);
                const { data } = resposne;
                if (data.code === 200) {
                    this.dialogRetPwdOperaion = false;
                    this.$swal.fire({
                        title: 'modify password',
                        text: data.msg,
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1000,
                    });
                    setTimeout(() => {
                        clearToken();
                        this.$router.push(`/login`);
                    }, 1200)
                } else {
                    this.$message.error(data.msg);
                }
            } catch (e) {
                this.dialogOperaion = false;
                this.$error(data.msg);
                console.error(`modify password exception:${e}`);
            }
        },
        handleAvatarSuccess(res, file) {
            if (res.code !== 200) {
                this.$message.error(`avatar upload exception`);
                return;
            }
            this.$message.success(`avatar upload success`);
            this.data.url = res.data;
        },
        // 监听菜单点击事件
        eventListener(event) {
            // 个人中心
            if (event === 'center') {
                this.dialogOperaion = !this.dialogOperaion;
                return;
            }
            // 密码重置
            if (event === 'resetPwd') {
                this.dialogRetPwdOperaion = true;
                return;
            }
            // 搜索
            if (event === 'search-detail') {
                this.$router.push('/search-detail');
                return;
            }
            // 退出登录
            if (event === 'loginOut') {
                this.loginOutOperation();
                return;
            }
            // 健康指标记录
            if (event === 'healthDataRecord') {
                this.$router.push('/record');
                return;
            }
        },
        async loginOutOperation() {
            const confirmed = await this.$swalConfirm({
                title: 'logout',
                text: `logout will require re-login to use system functions!`,
                icon: 'warning',
            });
            if (confirmed) { // 清除Token，路由至登录页
                clearToken();
                this.$router.push('/login');
            }
        },
        // Token检验
        async tokenCheckLoad() {
            try {
                const res = await this.$axios.get('user/auth');
                // 校验失败
                if (res.data.code === 400) {
                    clearToken();
                    this.$message.error(res.data.msg);
                    this.$router.push('/login');
                    return;
                }
                const { id: userId, userAvatar, userName, userRole, userEmail } = res.data.data;
                // 将用户信息存储起来
                sessionStorage.setItem('userInfo', JSON.stringify(res.data.data));
                this.userInfo = {
                    url: userAvatar,
                    name: userName,
                    role: userRole,
                    email: userEmail
                };
                this.data = { ...this.userInfo };
                // 根据角色解析路由
                const roleRouteKey = userRole === 1 ? 'admin' : 'user';
                const roleRoute = router.options.routes.find(route => route.path.startsWith(`/${roleRouteKey}`));
                if (roleRoute) {
                    this.routers = roleRoute.children;
                } else {
                    console.error('cannot find corresponding role route configuration');
                }
            } catch (error) {
                console.error('token check exception:', error);
            }
        }
    },
};
</script>
<style scoped lang="scss">
#nutrition-select {
    margin: 10px;
    padding: 5px;
    font-size: 16px;
    border: none;
    outline: none;
    width: 60%;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
}

.removeFood {
    color: rgba(0, 0, 0, 0.6);
    user-select: none;
    cursor: pointer;
    display: inline-block;
    margin-top: 10px;
}

.removeFood:hover {
    color: #1c1c1c;
}

label {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
}

.content-container {
    padding: 10px 120px;
    box-sizing: border-box;
    min-height: calc(100vh - 120px);
    overflow-x: hidden;
}

.modelInput {
    outline: none;
    border: none;
    font-size: 22px;
    width: 60%;
    font-weight: 800;
}

.avatar {
    width: 88px;
    height: 88px;
}
</style>
