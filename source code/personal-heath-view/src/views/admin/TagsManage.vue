<template>
    <el-row style="background-color: #FFFFFF;padding: 5px 0;border-radius: 5px;">
        <el-row style="padding: 10px;margin-left: 5px;">
            <el-row>
                <el-input size="small" style="width: 188px;margin-left: 5px;margin-right: 6px;"
                    v-model="tagsQueryDto.name" placeholder="标签名" clearable @clear="handleFilterClear">
                    <el-button slot="append" @click="handleFilter" icon="el-icon-search"></el-button>
                </el-input>
                <span style="float: right;">
                    <el-button size="small"
                        style="background-color: rgb(96, 98, 102);color: rgb(247,248,249);border: none;"
                        class="customer" type="info" @click="add()"><i class="el-icon-plus"></i>add tag</el-button>
                </span>
            </el-row>
        </el-row>
        <el-row style="margin: 0 20px;border-top: 1px solid rgb(245,245,245);">
            <el-table row-key="id" :data="tableData" style="width: 100%">
                <el-table-column prop="name" label="标签名"></el-table-column>
                <el-table-column label="操作" width="120">
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
        <el-dialog :show-close="false" :visible.sync="dialogOperaion" width="24%">
            <div slot="title">
                <p class="dialog-title">{{ !isOperation ? 'added tag' : 'edited tag' }}</p>
            </div>
            <div style="padding:0 20px;margin-bottom: 30px;">
                <el-row>
                    <input style="font-size: 34px;" class="dialog-input" v-model="data.name" placeholder="input" />
                </el-row>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" v-if="!isOperation"
                    style="background-color: rgb(96, 98, 102);color: rgb(247,248,249);border: none;" class="customer"
                    type="info" @click="addOperation()">added</el-button>
                <el-button size="small" v-else
                    style="background-color: rgb(96, 98, 102);color: rgb(247,248,249);border: none;" class="customer"
                    type="info" @click="updateOperation()">edit</el-button>
                <el-button class="customer" size="small" style="background-color: rgb(241, 241, 241);border: none;"
                    @click="cannel">cancel</el-button>
            </span>
        </el-dialog>
    </el-row>
</template>

<script>
export default {
    data() {
        return {
            userPwd: '',
            data: {},
            filterText: '',
            currentPage: 1,
            pageSize: 10,
            totalItems: 0,
            dialogOperaion: false, // 开关
            isOperation: false, // 开关-标识新增或修改
            tableData: [],
            searchTime: [],
            selectedRows: [],
            status: null,
            tagsQueryDto: {}, // 搜索条件
        };
    },
    created() {
        this.fetchFreshData();
    },
    methods: {
        cannel() {
            this.data = {};
            this.dialogOperaion = false;
            this.isOperation = false;
        },
        handleAvatarSuccess(res, file) {
            if (res.code !== 200) {
                this.$message.error(`tag avatar upload exception`);
                return;
            }
            this.$message.success(`tag avatat upload success`);
            this.data.userAvatar = res.data;
            console.log(this.data);
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
                title: 'delete tag',
                text: `delete connot be recovered`,
                icon: 'warning',
            });
            if (confirmed) {
                try {
                    let ids = this.selectedRows.map(entity => entity.id);
                    const response = await this.$axios.post(`/tags/batchDelete`, ids);
                    if (response.data.code === 200) {
                        this.$swal.fire({
                            title: 'delete tag',
                            text: response.data.msg,
                            icon: 'success',
                            showConfirmButton: false,
                            timer: 2000,
                        });
                        this.cannel();
                        this.fetchFreshData();
                        return;
                    }
                } catch (e) {
                    console.error(`tag info delete exception：`, e);
                }
            }
        },
        resetQueryCondition() {
            this.tagsQueryDto = {};
            this.searchTime = [];
            this.fetchFreshData();
        },
        // 修改信息
        async updateOperation() {
            try {
                const response = await this.$axios.put('/tags/update', this.data);
                this.$swal.fire({
                    title: 'tag info edit',
                    text: response.data.msg,
                    icon: response.data.code === 200 ? 'success' : 'error',
                    showConfirmButton: false,
                    timer: 1000,
                });
                if (response.data.code === 200) {
                    this.cannel();
                    this.fetchFreshData();
                }
            } catch (error) {
                console.error('sumit form exception:', error);
                this.$message.error('please try again！');
            }
        },
        // 信息新增
        async addOperation() {
            try {
                const response = await this.$axios.post('/tags/save', this.data);
                this.$message[response.data.code === 200 ? 'success' : 'error'](response.data.msg);
                if (response.data.code === 200) {
                    this.cannel();
                    this.fetchFreshData();
                }
            } catch (error) {
                console.error('sumit form exception:', error);
                this.$message.error('please try again！');
            }
        },
        async fetchFreshData() {
            try {
                // 请求参数
                const params = {
                    current: this.currentPage,
                    size: this.pageSize,
                    ...this.tagsQueryDto
                };
                const response = await this.$axios.post('/tags/query', params);
                const { data } = response;
                this.tableData = data.data;
                this.totalItems = data.total;
            } catch (error) {
                console.error('query tag info exception:', error);
            }
        },
        add() {
            this.dialogOperaion = true;
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
            this.dialogOperaion = true;
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