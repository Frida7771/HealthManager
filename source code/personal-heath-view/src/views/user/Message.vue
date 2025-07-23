<template>
    <div>
        <div style="line-height: 80px;padding: 0 50px;">
            <el-row>
                <el-col :span="6">
                    <Logo sysName="health" style="font-size: 26px;" />
                </el-col>
                <el-col :span="18">
                    <span style="float: right;display: flex; align-items: center; flex-wrap: wrap;">
                        <img style="width: 40px;height: 40px;border-radius: 15px;" :src="userInfo.userAvatar" />
                        <span style="margin-left: 8px;">{{ userInfo.userName }}</span>
                    </span>
                </el-col>
            </el-row>
        </div>
        <div style="height: 4px;background-color: rgb(248, 248, 248);"></div>
        <div style="padding: 4px 50px;">
            <div>
                <p style="font-size: 28px;padding: 4px 0;">
                    message center
                    <span @click="clearMessage" style="float: right;" class="clear-message">
                        <i class="el-icon-s-open"></i>
                    </span>
                </p>
            </div>
            <div>
                <span
                    :style="{ borderBottom: messageTypeItem === messageType.type ? '10px solid rgb(0, 122, 204)' : '' }"
                    @click="messageTypeSelected(messageType.type)" class="message-type"
                    v-for="(messageType, index) in messageTypes" :key="index">
                    {{ messageType.detail }}
                </span>
            </div>
            <div style="padding: 30px 0;">
                <div v-if="messageList.length === 0">
                    <el-empty description="no message"></el-empty>
                </div>
                <div>
                    <div style="margin-bottom: 5px;padding: 5px;border-radius: 5px;border: 1px solid rgb(241,241,241);"
                        :style="{ backgroundColor: !message.isRead ? 'rgb(250,250,250)' : '' }"
                        v-for="(message, index) in messageList" :key="index">
                        <el-row
                            style="padding: 25px 30px;display: flex;justify-content: left;align-items: center;gap: 10px;">
                            <div>
                                <span class="bell-icon">
                                    <span v-if="message.messageType === 1 || message.messageType === 2">
                                        <img style="width: 40px;height: 40px;border-radius: 20px;"
                                            :src="message.senderAvatar" alt="" srcset="">
                                    </span>
                                    <i v-if="message.messageType === 3" class="el-icon-data-analysis"></i>
                                </span>
                            </div>
                            <div>
                                <div>
                                    <div v-if="message.messageType === 1 || message.messageType === 2">
                                        <div style="font-size: 18px;">
                                            {{ message.senderName }}
                                        </div>
                                    </div>
                                    <div style="font-size: 18px;">
                                        <span class="message-content" v-if="message.messageType === 1"
                                            style="font-size: 14px;">{{ commentDeal(message.content)[2] }}</span>
                                        <span class="message-content"
                                            v-else-if="message.messageType === 3 || message.messageType === 4"
                                            style="font-size: 14px;">{{ message.content }}</span>
                                        <span class="message-content" v-else style="font-size: 14px;">liked your comment【{{
                                            message.content
                                            }}】</span>
                                    </div>
                                </div>
                                <div>
                                    <span class="message-time">{{ message.createTime }}</span>
                                    <span @click="replyUser(message)" v-if="message.messageType === 1"
                                        style="font-size: 10px;margin-left: 10px;cursor: pointer;">reply</span>
                                </div>
                            </div>
                        </el-row>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import Logo from '@/components/Logo';
import Swal from 'sweetalert2';
export default {
    components: { Logo },
    data() {
        return {
            userInfo: {},
            messageQueryDto: {},
            messageList: [],
            messageTypes: [],
            messageTypeItem: {},
            dialogEvaluationsOperation: false,
            message: {},
        };
    },
    created() {
        // 1. 拿到当前用户的信息
        this.getUserInfo();
        // 2. 加载用户全部消息
        this.loadAllUsersMessage();
        // 3. 加载全部的消息类型
        this.loadAllMessageType();
    },
    methods: {
        commentDeal(content) {
            return content.split(';');
        },
        // 回复用户
        replyUser(message) {
            Swal.fire({
                title: `reply【${message.senderName}】`,
                input: 'text',
                inputPlaceholder: 'reply content',
                showCancelButton: true,
                confirmButtonText: 'submit',
                cancelButtonText: 'cancel',
                inputValidator: (value) => {
                    if (!value) {
                        return 'content cannot be empty';
                    } else {
                        this.saveCommentData(message.senderId, value, this.commentDeal(message.content));
                    }
                }
            }).then((result) => {
                console.log("...");
            });
        },
        // 保存回复数据
        saveCommentData(senderId, content, ary) {
            const comment = {
                id: 1,
                content,
                parentId: ary[0],
                contentType: 'NEWS',
                contentId: ary[1],
                replierId: senderId
            }
            this.$axios.post('/evaluations/insert', comment).then(response => {
                const { data } = response;
                if (data.code === 200) {
                    this.$notify({
                        title: 'comment reply',
                        message: 'reply success',
                        type: 'success'
                    });
                }
            }).catch(error => {
                console.log("reply exception:", error);
            })
        },
        // 将全部的消息设置未已读
        async clearMessage() {
            const confirmed = await this.$swalConfirm({
                title: 'message clear',
                text: `whether to set all messages to read?`,
                icon: 'warning',
            });
            if (confirmed) {
                this.$axios.put('/message/clearMessage').then(response => {
                    const { data } = response;
                    if (data.code === 200) {
                        this.loadAllUsersMessage();
                    }
                })
            }
        },
        evaluationsPut() {
            this.$axios.put('/message/clearMessage').then(response => {
                const { data } = response;
                if (data.code === 200) {
                    this.loadAllUsersMessage();
                }
            })
        },
        // 做回复的
        replyEvalustions(message) {
            this.message = message;
            this.dialogEvaluationsOperation = true;
        },
        // 消息类型选中
        messageTypeSelected(messageType) {
            this.messageTypeItem = messageType;
            this.messageQueryDto.messageType = messageType;
            // 如果是评论数据，需要额外处理
            this.loadAllUsersMessage();
        },
        getUserInfo() {
            const userInfo = sessionStorage.getItem('userInfo');
            this.userInfo = JSON.parse(userInfo);
        },
        // 加载全部的消息类型
        loadAllMessageType() {
            this.$axios.get('/message/types').then(response => {
                const { data } = response;
                if (data.code === 200) {
                    this.messageTypes = data.data;
                    const messageType = { type: null, detail: 'all messages' };
                    this.messageTypes.unshift(messageType);
                    this.messageTypes.map(entity => entity.isCheck = false);
                    this.messageTypeSelected(this.messageTypes[0].type);
                }
            })
        },
        loadAllUsersMessage() {
            const userInfo = sessionStorage.getItem('userInfo');
            const entity = JSON.parse(userInfo);
            this.messageQueryDto.userId = entity.id;
            this.$axios.post('/message/query', this.messageQueryDto).then(response => {
                const { data } = response;
                if (data.code === 200) {
                    this.messageList = data.data;
                }
            })
        },
    },
};
</script>
<style scoped lang="scss">
.bell-icon {
    display: inline-block;
    height: 50px;
    width: 50px;
    border-radius: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgb(106, 190, 238);
    border: 3px solid rgb(92, 172, 219);

    i {
        line-height: 30px;
        width: 30px;
        text-align: center;
        font-size: 25px;
        color: #f1f1f1;
    }
}

.message-time {
    font-size: 12px;
    color: rgb(131, 104, 102);
}

.clear-message {
    display: inline-block;
    margin-left: 10px;
    padding: 6px 12px;
    border-radius: 5px;
}

.clear-message:hover {
    background-color: #f1f1f1;
}

.news-tags {
    display: inline-block;
    padding: 2px 5px;
    background-color: rgb(222, 243, 251);
    color: #1d3cc4;
    font-size: 14px;
    border-radius: 3px;
}

.message-type {
    display: inline-block;
    border-bottom: 10px solid rgb(255, 255, 255);
    padding-bottom: 10px;
    font-size: 16px;
    margin-right: 25px;
    border-top-left-radius: 4px;
    cursor: pointer;
}

.message-content {
    display: inline-block;
    margin: 5px 0;
    font-size: 22px;
}
</style>