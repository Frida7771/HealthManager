<template>
    <el-row style="background-color: #FFFFFF;padding: 5px 0;border-radius: 5px;">
        <el-row style="padding: 10px;margin-left: 10px;">
            <el-row>
                <el-date-picker size="small" style="width: 220px;" v-model="searchTime" type="daterange"
                    range-separator="to" start-placeholder="start" end-placeholder="end">
                </el-date-picker>
                <el-input size="small" style="width: 188px;margin-left: 5px;margin-right: 6px;"
                    v-model="userHealthQueryDto.userId" placeholder="user ID" clearable @clear="handleFilterClear">
                    <el-button slot="append" @click="handleFilter" icon="el-icon-search"></el-button>
                </el-input>
            </el-row>
        </el-row>
        <el-row style="margin: 0 20px;border-top: 1px solid rgb(245,245,245);">
            <el-table row-key="id" @selection-change="handleSelectionChange" :data="tableData">
                <el-table-column prop="name" width="88" label="status">
                    <template slot-scope="scope">
                        <i v-if="!statusCheck(scope.row)" style="margin-right: 5px;" class="el-icon-warning"></i>
                        <i v-else style="margin-right: 5px;color: rgb(253, 199, 50);" class="el-icon-success"></i>
                        <el-tooltip v-if="!statusCheck(scope.row)" class="item" effect="dark" content="abnormal"
                            placement="bottom-end">
                            <span style="text-decoration: underline;text-decoration-style: dashed;">abnormal</span>
                        </el-tooltip>
                        <span v-else>normal</span>
                    </template>
                </el-table-column>
                <el-table-column prop="value" width="148" label="value" sortable>
                    <template slot-scope="scope">
                        <span>{{ scope.row.value }}({{ scope.row.unit }})</span>
                    </template>
                </el-table-column>
                <el-table-column prop="userName" label="user"></el-table-column>
                <el-table-column prop="valueRange" width="128" label="threshold"></el-table-column>
                <el-table-column prop="name" width="130" label="model name">
                    <template slot-scope="scope">
                        <span><i class="el-icon-receiving" style="margin-right: 3px;"></i>{{ scope.row.name }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="unit" width="88" label="unit"></el-table-column>
                <el-table-column prop="symbol" width="88" label="symbol"></el-table-column>
                <el-table-column prop="userId" width="108" label="userID" sortable></el-table-column>
                <el-table-column prop="createTime" width="178" label="time" sortable></el-table-column>
                <el-table-column label="operation" width="80">
                    <template slot-scope="scope">
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
                <p class="dialog-title">{{ !isOperation ? 'added user info' : 'edit user info' }}</p>
            </div>
            <div style="padding:0 20px;">
                <!-- 图标 -->
                <el-row style="margin-top: 20px;">
                    <el-upload class="avatar-uploader" action="/api/personal-heath/v1.0/file/upload"
                        :show-file-list="false" :on-success="handleAvatarSuccess">
                        <img v-if="data.cover" :src="data.cover" style="height: 44px;width: 44px;">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                </el-row>
                <!-- 配置名 -->
                <el-row style="padding: 0 20px 0 0;">
                    <p>
                        <span class="modelName">*name</span>
                    </p>
                    <input class="input-title" v-model="data.name"
                        style="border-radius: 5px;background-color: #f1f1f1;">
                </el-row>
                <!-- 单位 -->
                <el-row style="padding: 0 20px 0 0;">
                    <p style="font-size: 12px;padding: 3px 0;">
                        <span class="modelName">*unit</span>
                    </p>
                    <input class="input-title" v-model="data.unit"
                        style="border-radius: 5px;background-color: #f1f1f1;">
                </el-row>
                <!-- 符号 -->
                <el-row style="padding: 0 20px 0 0;">
                    <p style="font-size: 12px;padding: 3px 0;">
                        <span class="modelName">*symbol</span>
                    </p>
                    <input class="input-title" v-model="data.symbol"
                        style="border-radius: 5px;background-color: #f1f1f1;">
                </el-row>
                <!-- 简介 -->
                <el-row style="padding: 0 20px 0 0;">
                    <p style="font-size: 12px;padding: 3px 0;">
                        <span class="modelName">*introduction</span>
                    </p>
                    <el-input style="border-radius: 5px;background-color: #f1f1f1;" type="textarea"
                        :autosize="{ minRows: 2, maxRows: 3 }" placeholder="input" v-model="data.detail">
                    </el-input>
                </el-row>
                <!-- 简介 -->
                <el-row style="padding: 0 20px 0 0;">
                    <p style="font-size: 12px;padding: 3px 0;">
                        <span class="modelName">*normal value range</span>
                    </p>
                    <el-slider v-model="valuesRange" range show-stops :max="1000">
                    </el-slider>
                </el-row>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" v-if="!isOperation" style="background-color: rgb(43, 121, 203);border: none;"
                    class="customer" type="info" @click="addOperation">add</el-button>
                <el-button size="small" v-else style="background-color: rgb(43, 121, 203);border: none;"
                    class="customer" type="info" @click="updateOperation">edit</el-button>
                <el-button class="customer" size="small" style="background-color: rgb(241, 241, 241);border: none;"
                    @click="dialogUserOperaion = false">cancel</el-button>
            </span>
        </el-dialog>
    </el-row>
</template>

<script>
export default {
    data() {
        return {
            data: {},
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
            userHealthQueryDto: {}, // 搜索条件
            messsageContent: '',
            tagsList: [],
            valuesRange: [10, 50]
        };
    },
    watch: {
        dialogUserOperaion(v1, v2) {
            if (!v1) {
                this.isOperation = !this.isOperation;
            }
            if (!v1 && v2) {
                this.data = {};
            }
        },
    },
    created() {
        this.fetchFreshData();
    },
    methods: {
        // 处理用户输入的值，是正常的还是异常的，给个状态
        statusCheck(data) {
            // 用户输入的值
            const inputValue = data.value;
            // 正常值范围
            const valueRange = data.valueRange;
            if (valueRange !== null && inputValue !== null) {
                const aryValueRange = valueRange.split(',');
                const minValue = aryValueRange[0];
                const maxValue = aryValueRange[1];
                return (Number(inputValue) > Number(minValue) && Number(inputValue) < Number(maxValue))
            }
        },
        handleAvatarSuccess(res, file) {
            if (res.code !== 200) {
                this.$message.error(`user health record cover upload exception`);
                return;
            }
            this.$message.success(`user health record cover upload success`);
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
                title: 'delete user health recod',
                text: `delete cannot be recovered`,
                icon: 'warning',
            });
            if (confirmed) {
                try {
                    let ids = this.selectedRows.map(entity => entity.id);
                    const response = await this.$axios.post(`/user-health/batchDelete`, ids);
                    if (response.data.code === 200) {
                        this.$swal.fire({
                            title: 'delete user health record',
                            text: response.data.msg,
                            icon: 'success',
                            showConfirmButton: false,
                            timer: 2000,
                        });
                        this.fetchFreshData();
                        return;
                    }
                } catch (e) {
                    this.$swal.fire({
                        title: 'user health record info delete exception',
                        text: e,
                        icon: 'error',
                        showConfirmButton: false,
                        timer: 2000,
                    });
                    console.error(`user health record info delete exception：`, e);
                }
            }
        },
        resetQueryCondition() {
            this.userHealthQueryDto = {};
            this.searchTime = [];
            this.fetchFreshData();
        },
        // 修改信息
        async updateOperation() {
            try {
                this.data.valueRange = this.valuesRange.join(',');
                const response = await this.$axios.put('/user-health/update', this.data);
                this.$swal.fire({
                    title: 'user health record info edit',
                    text: response.data.msg,
                    icon: response.data.code === 200 ? 'success' : 'error',
                    showConfirmButton: false,
                    timer: 1000,
                });
                if (response.data.code === 200) {
                    this.closeDialog();
                    this.fetchFreshData();
                    this.clearFormData();
                }
            } catch (error) {
                console.error('sumit form exception:', error);
                this.$message.error('please try again！');
            }
        },
        // 信息新增
        async addOperation() {
            try {
                // [20,252] ---> 20,252
                this.data.valueRange = this.valuesRange.join(',');
                const response = await this.$axios.post('/user-health/save', this.data);
                this.$message[response.data.code === 200 ? 'success' : 'error'](response.data.msg);
                if (response.data.code === 200) {
                    this.closeDialog();
                    this.fetchFreshData();
                    this.clearFormData();
                }
            } catch (error) {
                console.error('sumit form exception:', error);
                this.$message.error('please try again！');
            }
        },
        closeDialog() {
            this.dialogUserOperaion = false;
        },
        clearFormData() {
            this.data = {};
        },
        async fetchFreshData() {
            try {
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
                    ...this.userHealthQueryDto
                };
                const response = await this.$axios.post('/user-health/query', params);
                const { data } = response;
                this.tableData = data.data;
                this.totalItems = data.total;
            } catch (error) {
                console.error('query user health record info exception:', error);
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
            if (row.valueRange !== null) {
                this.valuesRange = row.valueRange.split(',');
            }
            this.data = { ...row }
        },
        handleDelete(row) {
            this.selectedRows.push(row);
            this.batchDelete();
        }
    },
};
</script>
<style scoped lang="scss">
.status-success {
    display: inline-block;
    padding: 1px 5px;
    border-radius: 2px;
    background-color: rgb(201, 237, 249);
    color: rgb(111, 106, 196);
    font-size: 12px;
}

.status-error {
    display: inline-block;
    padding: 1px 5px;
    border-radius: 2px;
    background-color: rgb(233, 226, 134);
    color: rgb(131, 138, 142);
    color: rgb(111, 106, 196);
    font-size: 12px;
}

.tag-tip {
    display: inline-block;
    padding: 5px 10px;
    border-radius: 5px;
    background-color: rgb(245, 245, 245);
    color: rgb(104, 118, 130);
}

.input-def {
    height: 40px;
    line-height: 40px;
    outline: none;
    border: none;
    font-size: 20px;
    color: rgb(102, 102, 102);
    font-weight: 900;
    width: 100%;
}

.dialog-footer {
    /* 使按钮水平居中 */
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 如果需要调整按钮之间的间距 */
.customer {
    margin: 0 8px;
    /* 根据需要调整间距 */
}
</style>