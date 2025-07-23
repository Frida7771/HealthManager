<template>
    <div>
        <div style="padding: 0 50px;">
            <div>
                <p style="font-size: 24px;padding: 10px 0;font-weight: bolder;">
                    <span @click="goBack" style="cursor: pointer;;display: inline-block;padding: 0 20px 0 0;">
                        <i class="el-icon-arrow-left"></i>
                        return home
                    </span>
                    health record
                </p>
            </div>
        </div>
        <div style="height: 6px;background-color: rgb(248, 248, 248);"></div>
        <div style="padding: 10px 20px;">
            <el-row>
                <el-col :span="6" style="border-right: 1px solid #f1f1f1;min-height: calc(100vh - 250px);">
                    <el-tabs v-model="activeName" @tab-click="handleClick" style="margin-right: 40px;">
                        <el-tab-pane label="global model" name="first"></el-tab-pane>
                        <el-tab-pane label="my model" name="second"></el-tab-pane>
                    </el-tabs>
                    <div style="padding: 20px 0 30px 0;">
                        <span @click="addModel"
                            style="cursor: pointer;;padding: 10px 20px;background-color: #000;border-radius: 5px;color: #fff;">
                            add model
                            <i class="el-icon-right"></i>
                        </span>
                    </div>
                    <div style="display: flex;justify-content: left;align-items: center;">
                        <span>model name</span>
                        <el-input style="width: 100px;" v-model="userHealthModel.name" placeholder="input" clearable
                            @clear="handleFilterClear">
                        </el-input>
                        <el-button class="customer" style="background-color: rgb(43, 121, 203);border: none;"
                            type="primary" @click="searModel">search</el-button>
                    </div>
                    <div
                        style="padding: 10px 6px;margin-right: 40px;height: 500px;overflow-y: scroll;overflow-x: hidden;">
                        <div @click="modelSelected(model)" class="item-model" v-for="(model, index) in modelList"
                            :key="index">
                            <el-tooltip class="item" effect="dark" :content="'this item configuration【' + model.name + '】，click to select'"
                                placement="bottom">
                                <el-row style="padding: 20px 0;">
                                    <el-col :span="4">
                                        <img :src="model.cover" style="width: 35px;height:35px;margin-top: 5px;">
                                    </el-col>
                                    <el-col :span="20">
                                        <div style="padding: 0 10px;">
                                            <div style="font-size: 24px;font-weight: bolder;">{{ model.name }}</div>
                                            <div style="font-size: 14px;margin-top: 5px;">
                                                <span>{{ model.unit }}</span>
                                                <span style="margin-left: 10px;">{{ model.symbol }}</span>
                                                <span @click="updateModel(model)" v-if="!model.isGlobal"
                                                    style="margin-left: 10px;color: #333;">modify</span>
                                                <span @click="deleteModel(model)" v-if="!model.isGlobal"
                                                    style="margin-left: 10px;color: red;">delete</span>
                                            </div>
                                        </div>
                                    </el-col>
                                </el-row>
                            </el-tooltip>
                        </div>
                    </div>
                </el-col>
                <el-col :span="18">
                    <div style="padding: 0 150px;box-sizing: border-box;">
                        <div style="padding: 15px 0;font-size:24px;">
                            data input panel
                            <span @click="clearData" style="font-size: 14px;margin-left: 20px;">reset</span>
                        </div>
                        <el-row>
                            <el-row v-if="selectedModel.length === 0">
                                <el-empty description="select model to record"></el-empty>
                            </el-row>
                            <el-row>
                                <el-col :span="12" v-for="(model, index) in selectedModel" :key="index">
                                    <h3>{{ model.name }}({{ model.unit }})</h3>
                                    <input type="text" v-model="model.value" class="input-model"
                                        :placeholder="'normal value range：' + model.valueRange">
                                </el-col>
                            </el-row>
                        </el-row>

                    </div>
                    <div style="padding: 50px 150px;">
                        <span @click="toRecord"
                            style="cursor: pointer;padding: 10px 20px;background-color: #000;border-radius: 5px;color: #fff;">
                            record now
                            <i class="el-icon-right"></i>
                        </span>
                    </div>
                </el-col>
            </el-row>
        </div>
        <el-dialog :show-close="false" :visible.sync="dialogUserOperaion" width="26%">
            <div slot="title">
                <p class="dialog-title">{{ !isOperation ? 'add health model' : 'modify health model' }}</p>
            </div>
            <div style="padding:0 20px;">
                <p>*icon</p>
                <!-- 图标 -->
                <el-row style="margin-top: 10px;">
                    <el-upload class="avatar-uploader" action="/api/personal-heath/v1.0/file/upload"
                        :show-file-list="false" :on-success="handleAvatarSuccess">
                        <img v-if="data.cover" :src="data.cover" style="height: 64px;width: 64px;">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                </el-row>
                <!-- 配置名 -->
                <el-row style="padding: 0 10px 0 0;">
                    <p>
                        <span class="modelName">*model name</span>
                    </p>
                    <input class="input-title" v-model="data.name" placeholder="input">
                </el-row>
                <!-- 单位 -->
                <el-row style="padding: 0 10px 0 0;">
                    <p style="font-size: 12px;padding: 3px 0;">
                        <span class="modelName">*unit</span>
                    </p>
                    <input class="input-title" v-model="data.unit" placeholder="input">
                </el-row>
                <!-- 符号 -->
                <el-row style="padding: 0 10px 0 0;">
                    <p style="font-size: 12px;padding: 3px 0;">
                        <span class="modelName">*symbol</span>
                    </p>
                    <input class="input-title" v-model="data.symbol" placeholder="input">
                </el-row>
                <!-- 正常值 -->
                <el-row style="padding: 0 20px 0 0;">
                    <p style="font-size: 12px;padding: 3px 0;">
                        <span class="modelName">*threshold（format：min,max）</span>
                    </p>
                    <input class="input-title" v-model="data.valueRange" placeholder="input">
                </el-row>
                <!-- 简介 -->
                <el-row style="padding: 0 10px 0 0;">
                    <p style="font-size: 12px;padding: 3px 0;">
                        <span class="modelName">*detail</span>
                    </p>
                    <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 3 }" placeholder="detail"
                        v-model="data.detail">
                    </el-input>
                </el-row>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" v-if="!isOperation" style="background-color: rgb(43, 121, 203);border: none;"
                    class="customer" type="info" @click="addOperation">add</el-button>
                <el-button size="small" v-else style="background-color: rgb(43, 121, 203);border: none;"
                    class="customer" type="info" @click="updateOperation">modify</el-button>
                <el-button class="customer" size="small" style="background-color: rgb(241, 241, 241);border: none;"
                    @click="cannel()">cancel</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import Logo from '@/components/Logo';
export default {
    components: { Logo },
    data() {
        return {
            data: { cover: '' },
            userInfo: {},
            modelList: [],
            activeName: 'first',
            userHealthModel: { isGlobal: true },
            dialogUserOperaion: false,
            isOperation: false,
            userId: null,
            selectedModel: [],
        };
    },
    created() {
        this.getUserInfo();
        this.getAllModelConfig();
        this.getUser();
    },
    methods: {
        async clearData() {
            const confirmed = await this.$swalConfirm({
                title: "reset data?",
                text: `reset will require re-input, whether to continue?`,
                icon: 'warning',
            });
            if (confirmed) {
                this.selectedModel = [];
            }
        },
        cannel() {
            this.data = {};
            this.dialogUserOperaion = false;
            this.isOperation = false;
            this.cover = '';
        },
        // 发送修改请求
        updateOperation() {
            this.$axios.put('/health-model-config/update', this.data).then(response => {
                const { data } = response;
                if (data.code === 200) {
                    this.dialogUserOperaion = false;
                    this.isOperation = false;
                    this.data = {};
                    this.$swal.fire({
                        title: 'model modify',
                        text: 'model modify success',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1000,
                    });
                    // 继续加载最新的模型数据
                    this.getAllModelConfig();
                }
            })
        },
        // 修改自己配置的模型
        updateModel(model) {
            this.data = model;
            this.dialogUserOperaion = true;
            this.isOperation = true;
        },
        // 删除自己配置的模型
        async deleteModel(model) {
            const confirmed = await this.$swalConfirm({
                title: 'delete model【' + model.name + "】",
                text: `delete cannot be recovered, whether to continue?`,
                icon: 'warning',
            });
            if (confirmed) {
                const ids = [];
                ids.push(model.id);
                // 写删除请求
                this.$axios.post('/health-model-config/batchDelete', ids).then(response => {
                    const { data } = response;
                    if (data.code === 200) {
                        this.$swal.fire({
                            title: 'model delete',
                            text: 'model delete success',
                            icon: 'success',
                            showConfirmButton: false,
                            timer: 1000,
                        });
                        // 继续加载最新的模型数据
                        this.getAllModelConfig();
                        // 如果已经选中对应的模型，从列表中删除对应的项
                        this.selectedModel = this.selectedModel.filter(entity => entity.id !== model.id);
                    }
                })
            }
        },
        goBack() {
            this.$router.push('/user');
        },
        // 记录值
        toRecord() {
            if (!this.selectedModel.length) {
                this.$message.error('Please select at least one model to record.');
                return;
            }
            const userId = this.userId;
            const userHealths = this.selectedModel.map(entity => {
                if (!entity.value || isNaN(Number(entity.value))) {
                    throw new Error(`Please enter a valid value for ${entity.name}`);
                }
                return {
                    healthModelConfigId: entity.id,
                    value: entity.value,
                    userId // 如果后端需要
                }
            });
            this.$axios.post('/user-health/save', userHealths).then(response => {
                const { data } = response;
                if (data.code === 200) {
                    this.$notify({
                        duration: 1000,
                        title: 'record operation',
                        message: 'record success',
                        type: 'success'
                    });
                    setTimeout(() => {
                        this.$router.push('/user');
                    }, 2000)
                }
            }).catch(err => {
                this.$message.error('Record failed, please check your input!');
                console.error(err);
            });
        },
        modelSelected(model) {
            const saveFlag = this.selectedModel.find(entity => entity.id === model.id);
            if (!saveFlag) {
                // 不存在则添加
                this.selectedModel.push(model);
            }
        },
        searModel() {
            this.getAllModelConfig();
        },
        handleFilterClear() {
            this.userHealthModel.name = '';
            this.getAllModelConfig();
        },
        handleAvatarSuccess(res, file) {
            if (res.code !== 200) {
                this.$message.error(`health model cover upload exception`);
                return;
            }
            this.$message.success(`health model cover upload success`);
            this.data.cover = res.data;
        },
        getUser() {
            const userInfo = sessionStorage.getItem('userInfo');
            const entity = JSON.parse(userInfo);
            this.userId = entity.id;
        },
        async addOperation() {
            try {
                this.data.userId = this.userId;
                const response = await this.$axios.post('/health-model-config/save', this.data);
              
                if (response.data.code === 200) {
                    this.dialogUserOperaion = false;
                    this.getAllModelConfig();
                    this.data = {};
                    this.$notify.info({
                        duration: 1000,
                        title: 'model add',
                        message: 'add success'
                    });
                } else {
                    this.$notify.info({
                        duration: 1000,
                        title: 'model add',
                        message: response.data.msg
                    });
                }
            } catch (error) {
                console.error('submit form exception:', error);
                this.$message.error('submit failed, please try again!');
            }
        },
        addModel() {
            this.dialogUserOperaion = true;
        },
        handleClick(tab, event) {
            // 先去清空条件
            this.userHealthModel = {};
            if (this.activeName === 'first') {
                this.userHealthModel.isGlobal = true;
            } else {
                const userInfo = sessionStorage.getItem('userInfo');
                const entity = JSON.parse(userInfo);
                this.userHealthModel.userId = entity.id;
            }
            this.getAllModelConfig();
        },
        getAllModelConfig() {
            this.$axios.post('/health-model-config/query', this.userHealthModel).then(response => {
                const { data } = response;
                if (data.code === 200) {
                    this.modelList = data.data;
                }
            });
        },
        getUserInfo() {
            const userInfo = sessionStorage.getItem('userInfo');
            this.userInfo = JSON.parse(userInfo);
        },
    },
};
</script>
<style scoped lang="scss">
.item-model:hover {
    cursor: pointer;
    background-color: #fafafa;
    border-radius: 5px;
}

.item-model {
    padding: 8px;
    box-sizing: border-box;
}

.input-model {
    font-size: 20px;
    box-sizing: border-box;
    font-weight: bold;
    padding: 20px;
    user-select: none;
    border-radius: 5px;
    border: none;
    outline: none;
    background-color: #f1f1f1;
    height: 50px;
    width: 85%;
}
</style>