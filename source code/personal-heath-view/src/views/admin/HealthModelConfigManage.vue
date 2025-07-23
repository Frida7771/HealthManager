<template>
    <el-row style="background-color: #FFFFFF;padding: 5px 0;border-radius: 5px;">
        <el-row style="padding: 10px;margin-left: 5px;">
            <el-row>
                <el-input size="small" style="width: 188px;margin-left: 5px;margin-right: 6px;"
                    v-model="healthModelConfigQueryDto.name" placeholder="name" clearable @clear="handleFilterClear">
                    <el-button slot="append" @click="handleFilter" icon="el-icon-search"></el-button>
                </el-input>
                <span style="float: right;">
                    <el-button size="small"
                        style="background-color: rgb(96, 98, 102);color: rgb(247,248,249);border: none;"
                        class="customer" type="info" @click="add()"><i class="el-icon-plus"></i>add model</el-button>
                </span>
            </el-row>
        </el-row>
        <el-row style="margin: 0 20px;border-top: 1px solid rgb(245,245,245);">
            <el-table row-key="id" @selection-change="handleSelectionChange" :data="tableData" style="width: 100%">
                <el-table-column prop="cover" width="80" label="model icon">
                    <template slot-scope="scope">
                        <img :src="scope.row.cover" style="width: 30px;height: 30px;border-radius: 5px;" />
                    </template>
                </el-table-column>
                <el-table-column prop="name" width="218" label="model name"></el-table-column>
                <el-table-column prop="isGlobal" label="permission" width="128">
                    <template slot-scope="scope">
                        <span>{{ scope.row.isGlobal ? 'global model' : 'private model' }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="userName" width="108" label="config user"></el-table-column>
                <el-table-column prop="valueRange" width="178" label="value range"></el-table-column>
                <el-table-column prop="unit" width="88" label="unir"></el-table-column>
                <el-table-column prop="symbol" width="88" label="symble"></el-table-column>
                <el-table-column prop="detail" label="model introduction"></el-table-column>
                <el-table-column label="operation" width="120">
                    <template slot-scope="scope">
                        <span class="text-button" @click="handleEdit(scope.row)">edit</span>
                        <span class="text-button" @click="handleDelete(scope.row)">delete</span>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination style="margin: 20px 0;" @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="currentPage" :page-sizes="[10, 20]" :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper" :total="totalItems"></el-pagination>
        </el-row>
        <el-dialog :show-close="false" :visible.sync="dialogUserOperaion" width="26%">
            <div slot="title">
                <p class="dialog-title">{{ !isOperation ? 'model added' : 'model edited' }}</p>
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
                        <span class="modelName">*config name</span>
                    </p>
                    <input class="input-title" v-model="data.name" placeholder="input">
                </el-row>
                <!-- 单位 -->
                <el-row style="padding: 0 10px 0 0;">
                    <p style="font-size: 12px;padding: 3px 0;">
                        <span class="modelName">*unit</span>
                    </p>
                    <input class="input-title" v-model="data.unit" placeholder="请输入">
                </el-row>
                <!-- 符号 -->
                <el-row style="padding: 0 10px 0 0;">
                    <p style="font-size: 12px;padding: 3px 0;">
                        <span class="modelName">*symble</span>
                    </p>
                    <input class="input-title" v-model="data.symbol" placeholder="请输入">
                </el-row>
                <!-- 正常值 -->
                <el-row style="padding: 0 20px 0 0;">
                    <p style="font-size: 12px;padding: 3px 0;">
                        <span class="modelName">*max value (format: min, max)</span>
                    </p>
                    <input class="input-title" v-model="data.valueRange" placeholder="请输入">
                </el-row>
                <!-- 简介 -->
                <el-row style="padding: 0 10px 0 0;">
                    <p style="font-size: 12px;padding: 3px 0;">
                        <span class="modelName">*introduction</span>
                    </p>
                    <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 3 }" placeholder="简介"
                        v-model="data.detail">
                    </el-input>
                </el-row>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" v-if="!isOperation" style="background-color: rgb(43, 121, 203);border: none;"
                    class="customer" type="info" @click="addOperation">new model</el-button>
                <el-button size="small" v-else style="background-color: rgb(43, 121, 203);border: none;"
                    class="customer" type="info" @click="updateOperation">edit model</el-button>
                <el-button class="customer" size="small" style="background-color: rgb(241, 241, 241);border: none;"
                    @click="cannel()">cancel</el-button>
            </span>
        </el-dialog>
    </el-row>
</template>

<script>
export default {
    data() {
        return {
            data: { cover: '' },
            filterText: '',
            currentPage: 1,
            pageSize: 10,
            totalItems: 0,
            dialogUserOperaion: false, // 开关
            isOperation: false, // 开关-标识新增或修改
            tableData: [],
            searchTime: [],
            selectedRows: [],
            status: null,
            healthModelConfigQueryDto: {}, // 搜索条件
            messsageContent: '',
            tagsList: [],
            valuesRange: [10, 50]
        };
    },
    created() {
        this.fetchFreshData();
    },
    methods: {
        handleAvatarSuccess(res, file) {
            this.$notify({
                duration: 2000,
                title: 'icon uploaded',
                message: res.code === 200 ? 'success' : 'exception',
                type: res.code === 200 ? 'success' : 'error'
            });
            this.data.cover = res.data;
        },
        // 多选框选中
        handleSelectionChange(selection) {
            this.selectedRows = selection;
        },
        // 批量删除数据
        async batchDelete() {
            if (!this.selectedRows.length) {
                this.$message(`non data selected`);
                return;
            }
            const confirmed = await this.$swalConfirm({
                title: 'delete model',
                text: `delete cannot be recovered`,
                icon: 'warning',
            });
            if (confirmed) {
                try {
                    let ids = this.selectedRows.map(entity => entity.id);
                    const response = await this.$axios.post(`/health-model-config/batchDelete`, ids);
                    if (response.data.code === 200) {
                        this.$notify({
                            duration: 2000,
                            title: 'delete operation',
                            message: 'success',
                            type: 'success'
                        });
                        this.fetchFreshData();
                        return;
                    }
                } catch (e) {
                    console.error(`health model info delete exception：`, e);
                }
            }
        },
        resetQueryCondition() {
            this.healthModelConfigQueryDto = {};
            this.searchTime = [];
            this.fetchFreshData();
        },
        // 修改信息
        async updateOperation() {
            this.$axios.put('/health-model-config/update', this.data).then(res => {
                if (res.data.code === 200) {
                    this.cannel();
                    this.fetchFreshData();
                    this.$notify({
                        duration: 2000,
                        title: 'edit operation',
                        message: 'success',
                        type: 'success'
                    });
                }
            }).catch(error => {
                console.log('model edit exception=>', error);
            })
        },
        cannel() {
            this.dialogUserOperaion = false;
            this.isOperation = false;
            this.data = {};
            this.valueRange = null;
        },
        // 模型新增
        addOperation() {
            this.$axios.post('/health-model-config/config/save', this.data).then(res => {
                if (res.data.code === 200) {
                    this.cannel();
                    this.fetchFreshData();
                    this.$notify({
                        duration: 2000,
                        title: 'add operation',
                        message: 'success',
                        type: 'success'
                    });
                }else{
                    this.$notify({
                        duration: 1000,
                        title: 'add operation',
                        message: res.data.msg,
                        type: 'info'
                    });
                }
            }).catch(error => {
                console.log('model add exception=>', error);
            })
        },
        // 模型查询
        async fetchFreshData() {
            try {
                this.tableData = [];
                let startTime = null;
                let endTime = null;
                if (this.searchTime != null && this.searchTime.length === 2) {
                    const [startDate, endDate] = await Promise.all(this.searchTime.map(date => date.toISOString()));
                    startTime = `${startDate.split('T')[0]}T00:00:00`;
                    endTime = `${endDate.split('T')[0]}T23:59:59`;
                }
                // 请求参数
                const params = {
                    current: this.currentPage,
                    size: this.pageSize,
                    startTime: startTime,
                    endTime: endTime,
                    ...this.healthModelConfigQueryDto
                };
                const response = await this.$axios.post('/health-model-config/query', params);
                const { data } = response;
                this.tableData = data.data;
                this.totalItems = data.total;
            } catch (error) {
                console.error('query health model info exception:', error);
            }
        },
        add() {
            this.dialogUserOperaion = true;
        },
        handleFilter() {
            this.currentPage = 1;
            this.fetchFreshData();
        },
        handleFilterClear() {
            this.filterText = '';
            this.handleFilter();
        },
        handleSizeChange(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.fetchFreshData();
        },
        handleCurrentChange(val) {
            this.currentPage = val;
            this.fetchFreshData();
        },
        handleEdit(row) {
            this.dialogUserOperaion = true;
            this.isOperation = true;
            this.data = { ...row }
        },
        handleDelete(row) {
            this.selectedRows.push(row);
            this.batchDelete();
        }
    },
};
</script>
<style scoped lang="scss"></style>