<template>
    <el-row style="background-color: #FFFFFF;padding: 10px 0;border-radius: 5px;">
        <el-row style="padding: 10px;margin-left: 5px;">
            <el-row>
                <el-date-picker size="small" style="margin-left: 10px;width: 220px;" v-model="searchTime"
                    type="daterange" range-separator="to" start-placeholder="start" end-placeholder="end">
                </el-date-picker>
                <el-input size="small" style="width: 188px;margin-left: 5px;margin-right: 6px;"
                    v-model="messageQueryDto.content" placeholder="content" clearable @clear="handleFilterClear">
                    <el-button slot="append" @click="handleFilter" icon="el-icon-search"></el-button>
                </el-input>
                <span style="float: right;">
                    <el-button size="small"
                        style="background-color: rgb(96, 98, 102);color: rgb(247,248,249);border: none;"
                        class="customer" type="info" @click="allMessagePush"><i
                            class="el-icon-plus"></i>message push</el-button>
                </span>
            </el-row>
        </el-row>
        <el-row style="margin: 0 20px;border-top: 1px solid rgb(245,245,245);">
            <el-table :data="tableData" style="width: 100%">
                <el-table-column prop="name" width="98" label="read status">
                    <template slot-scope="scope">
                        <span>{{ scope.row.isRead ? 'read' : 'unread' }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="messageType" width="148" label="message type">
                    <template slot-scope="scope">
                        <span v-if="scope.row.messageType === 1">comment reply</span>
                        <span v-else-if="scope.row.messageType === 2">comment like</span>
                        <span v-else-if="scope.row.messageType === 3">index reminder</span>
                        <span v-else>system notification</span>
                    </template>
                </el-table-column>
                <el-table-column prop="receiverName" width="108" label="receiver"></el-table-column>
                <el-table-column prop="content" label="message body">
                    <template slot-scope="scope">
                        <div>{{ parseText(scope.row.content) }}</div>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" width="168" label="send time"></el-table-column>
                <el-table-column label="operation" width="88">
                    <template slot-scope="scope">
                        <span class="text-button" @click="handleDelete(scope.row)">delete</span>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination style="margin: 20px 0;" @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="currentPage" :page-sizes="[10, 20]" :page-size="pageSize"
                layout="total, sizes, prev, pager, next, jumper" :total="totalItems"></el-pagination>
        </el-row>
        <!-- 全站消息推送 -->
        <el-dialog :show-title="false" :show-close="false" :visible.sync="dialogMessageOperation" width="24%">
            <p style="padding: 20px 0  0 20px;">message push</p>
            <div style="padding:0 20px;">
                <el-row>
                    <span class="dialog-hover">message content</span>
                    <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="input"
                        v-model="messageContent">
                    </el-input>
                </el-row>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" style="background-color: rgb(43, 121, 203);border: none;" class="customer"
                    type="info" @click="messagePushOperation">confirm push</el-button>
                <el-button class="customer" size="small" style="background-color: rgb(241, 241, 241);border: none;"
                    @click="dialogMessageOperation = false">cancel</el-button>
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
            tableData: [],
            searchTime: [],
            selectedRows: [],
            messageQueryDto: {}, // 搜索条件
            messsageContent: '',
            messageTypeList: [],
            dialogMessageOperation: false, // 开关变量，控制消息的对话框显示与否
            messageContent: ''
        };
    },
    created() {
        this.fetchFreshData();
        this.loadAllMessageType();
    },
    methods: {
        parseText(text) {
            // 使用正则表达式判断文本是否符合由分号分隔且至少有三项的结构
            const pattern = /^([^;]+;){2}[^;]+$/;
            if (pattern.test(text)) {
                // 使用分号分割文本
                const parts = text.split(';');
                // 返回第三项内容
                return parts[2];
            }
            // 若不满足条件则返回原文本
            return text;
        },
        messagePushOperation() {
            const message = {
                content: this.messageContent
            }
            this.$axios.post('/message/systemInfoUsersSave', message).then(response => {
                const { data } = response;
                if (data.code === 200) {
                    this.$notify({
                        duration: 2000,
                        title: 'push operation',
                        message: 'success',
                        type: 'success'
                    });
                    this.dialogMessageOperation = false;
                    this.messageContent = '';
                }
            })
        },
        allMessagePush() {
            this.dialogMessageOperation = true;
        },
        loadAllMessageType() {
            this.$axios.get('/message/types').then(response => {
                const { data } = response;
                if (data.code === 200) {
                    this.messageTypeList = data.data;
                }
            })
        },
        // 批量删除数据
        async batchDelete() {
            if (!this.selectedRows.length) {
                this.$message(`non data selected`);
                return;
            }
            const confirmed = await this.$swalConfirm({
                title: 'delete message',
                text: `delete cannot be recovered`,
                icon: 'warning',
            });
            if (confirmed) {
                try {
                    let ids = this.selectedRows.map(entity => entity.id);
                    const response = await this.$axios.post(`/message/batchDelete`, ids);
                    if (response.data.code === 200) {
                        this.$swal.fire({
                            title: 'delete message',
                            text: response.data.msg,
                            icon: 'success',
                            showConfirmButton: false,
                            timer: 2000,
                        });
                        this.fetchFreshData();
                        return;
                    }
                } catch (e) {
                    console.error(`message info delete exception`, e);
                }
            }
        },
        resetQueryCondition() {
            this.messageQueryDto = {};
            this.searchTime = [];
            this.fetchFreshData();
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
                    ...this.messageQueryDto
                };
                const response = await this.$axios.post('/message/query', params);
                const { data } = response;
                this.tableData = data.data;
                this.totalItems = data.total;
            } catch (error) {
                console.error('query message info exception:', error);
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