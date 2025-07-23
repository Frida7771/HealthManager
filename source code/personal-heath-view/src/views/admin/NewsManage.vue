<template>
    <el-row style="background-color: #FFFFFF;padding: 5px 0;border-radius: 5px;">
        <el-row style="padding: 10px;margin-left: 10px;">
            <el-row>
                <el-select @change="changeNewsTag" size="small" v-model="newsQueryDto.tagId" placeholder="news category">
                    <el-option v-for="tag in tagsList" :key="tag.id" :label="tag.name" :value="tag.id">
                    </el-option>
                </el-select>
                <el-date-picker size="small" style="margin-left: 5px;width: 220px;" v-model="searchTime"
                    type="daterange" range-separator="to" start-placeholder="start" end-placeholder="end">
                </el-date-picker>
                <el-input size="small" style="width: 188px;margin-left: 5px;margin-right: 6px;"
                    v-model="newsQueryDto.name" placeholder="input" clearable @clear="handleFilterClear">
                    <el-button slot="append" @click="handleFilter" icon="el-icon-search"></el-button>
                </el-input>
                <span style="float: right;">
                    <el-button size="small"
                        style="background-color: rgb(96, 98, 102);color: rgb(247,248,249);border: none;"
                        class="customer" type="info" @click="add()"><i class="el-icon-plus"></i>add news</el-button>
                </span>
            </el-row>
        </el-row>
        <el-row style="margin: 0 20px;border-top: 1px solid rgb(245,245,245);">
            <el-table row-key="id" @selection-change="handleSelectionChange" :data="tableData" style="width: 100%">
                <el-table-column prop="cover" width="80" label="cover">
                    <template slot-scope="scope">
                        <img :src="scope.row.cover" style="width: 48px;height: 34px;border-radius: 5px;" />
                    </template>
                </el-table-column>
                <el-table-column prop="tagName" width="138" label="category">
                    <template slot-scope="scope">
                        <span><i class="el-icon-discount" style="margin-right: 3px;"></i>
                            {{ scope.row.tagName }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="isTop" width="128" label="recommend">
                    <template slot-scope="scope">
                        <i v-if="!scope.row.isTop" style="margin-right: 5px;" class="el-icon-warning"></i>
                        <i v-else style="margin-right: 5px;color: rgb(253, 199, 50);" class="el-icon-success"></i>
                        <el-tooltip v-if="!scope.row.isTop" class="item" effect="dark" content="not recommend"
                            placement="bottom-end">
                            <span
                                style="cursor: pointer;;text-decoration: underline;text-decoration-style: dashed;">not recommend</span>
                        </el-tooltip>
                        <span v-else>recommend</span>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" width="168" label="publish time"></el-table-column>
                <el-table-column prop="name" label="title"></el-table-column>
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
        <el-dialog :show-close="false" :visible.sync="dialogUserOperaion" width="50%">
            <div slot="title">
                <p class="dialog-title">{{ !isOperation ? 'added news' : 'edited news' }}</p>
            </div>
            <div style="padding:0 20px;">
                <!-- 封面 -->
                <el-row style="margin-top: 10px;">
                    <p>*cover</p>
                    <el-upload class="avatar-uploader" action="/api/personal-heath/v1.0/file/upload"
                        :show-file-list="false" :on-success="handleAvatarSuccess">
                        <img v-if="data.cover" :src="data.cover" style="height: 120px;width: 188px;">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                </el-row>
                <!-- 标题 -->
                <el-row>
                    <p>*title</p>
                    <input style="font-size: 32px;line-height: 45px;" class="dialog-input" v-model="data.name" placeholder="input" />
                </el-row>
                <!-- 标签 -->
                <el-row style="margin: 12px 0;">
                    <el-row>
                        <span class="dialog-hover">category</span>
                    </el-row>
                    <el-radio-group style="margin-top: 10px;" v-model="data.tagId">
                        <el-radio :key="index" :label="tag.id" v-for="(tag, index) in tagsList">{{ tag.name
                            }}</el-radio>
                    </el-radio-group>
                </el-row>
                <!-- 推荐 -->
                <el-row style="margin: 12px 0;">
                    <el-row>
                        <span class="dialog-hover">recommend</span>
                    </el-row>
                    <el-switch style="user-select: none;padding: 0 6px;" v-model="data.isTop" active-color="#13ce66"
                        inactive-color="rgb(226, 226, 226)">
                    </el-switch>
                </el-row>
                <el-row>
                    <p>*content</p>
                    <Editor height="calc(100vh - 500px)" :receiveContent="data.content"
                        @on-receive="onReceiveContent" />
                </el-row>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" v-if="!isOperation"
                    style="background-color: rgb(96, 98, 102);color: rgb(247,248,249);border: none;" class="customer"
                    type="info" @click="addOperation()">add news</el-button>
                <el-button size="small" v-else
                    style="background-color: rgb(96, 98, 102);color: rgb(247,248,249);border: none;" class="customer"
                    type="info" @click="updateOperation()">edit</el-button>
                <el-button class="customer" size="small" style="background-color: rgb(241, 241, 241);border: none;"
                    @click="dialogUserOperaion = false">cancel</el-button>
            </span>
        </el-dialog>
    </el-row>
</template>

<script>
import Editor from "@/components/Editor"
export default {
    components: { Editor },
    data() {
        return {
            userPwd: '',
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
            newsQueryDto: {}, // 搜索条件
            messsageContent: '',
            tagsList: []
        };
    },
    created() {
        this.fetchFreshData();
        this.loadAllTags();
    },
    methods: {
        changeNewsTag(tagId){
            this.newsQueryDto.tagId = tagId;
            this.fetchFreshData();
        },
        onReceiveContent(html) {
            this.data.content = html;
        },
        // 加载全部的资讯数据
        loadAllTags() {
            this.$axios.post(`/tags/query`, {}).then(response => {
                const { data } = response;
                if (data.code === 200) {
                    this.tagsList = data.data;
                    this.tagsList.unshift({ name: 'all', id: null });
                }
            })
        },
        handleAvatarSuccess(res, file) {
            if (res.code !== 200) {
                this.$message.error(`news cover upload exception`);
                return;
            }
            this.data.cover = '';
            this.$message.success(`news cover upload success`);
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
                title: 'delete news',
                text: `delete cannot be recovered`,
                icon: 'warning',
            });
            if (confirmed) {
                try {
                    let ids = this.selectedRows.map(entity => entity.id);
                    const response = await this.$axios.post(`/news/batchDelete`, ids);
                    if (response.data.code === 200) {
                        this.$swal.fire({
                            title: 'delete news',
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
                        title: 'news info delete exception',
                        text: e,
                        icon: 'error',
                        showConfirmButton: false,
                        timer: 2000,
                    });
                    console.error(`news info delete exception：`, e);
                }
            }
        },
        resetQueryCondition() {
            this.newsQueryDto = {};
            this.searchTime = [];
            this.fetchFreshData();
        },
        // 修改信息
        async updateOperation() {
            try {
                const response = await this.$axios.put('/news/update', this.data);
                this.$swal.fire({
                    title: 'news info edit',
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
                this.$message.error('please try again!');
            }
        },
        // 信息新增
        async addOperation() {
            try {
                const response = await this.$axios.post('/news/save', this.data);
                this.$message[response.data.code === 200 ? 'success' : 'error'](response.data.msg);
                if (response.data.code === 200) {
                    this.closeDialog();
                    this.fetchFreshData();
                    this.clearFormData();
                }
            } catch (error) {
                console.error('sumit form exception:', error);
                this.$message.error('please try again!');
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
                    ...this.newsQueryDto
                };
                const response = await this.$axios.post('/news/query', params);
                const { data } = response;
                this.tableData = data.data;
                this.totalItems = data.total;
            } catch (error) {
                console.error('query news info exception', error);
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
            row.userPwd = null;
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