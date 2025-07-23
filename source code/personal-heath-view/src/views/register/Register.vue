<template>
    <div class="register-container">
        <div class="bg-overlay"></div>
        <div class="register-panel">
            <div class="logo-section">
                <Logo sysName="no account? register" />
                <h2 class="slogan">start your healthy life journey</h2>
            </div>
            <div class="input-group">
                <i class="fa-solid fa-user"></i>
                <input v-model="act" class="input-field" placeholder="register account" />
            </div>
            <div class="input-group">
                <i class="fa-solid fa-signature"></i>
                <input v-model="name" class="input-field" placeholder="user name" />
            </div>
            <div class="input-group">
                <i class="fa-solid fa-lock"></i>
                <input v-model="pwd" class="input-field" type="password" placeholder="input password" />
            </div>
            <div class="input-group">
                <i class="fa-solid fa-lock"></i>
                <input v-model="pwdConfirm" class="input-field" type="password" placeholder="confirm password" />
            </div>
            <div class="button-group">
                <span class="register-button" @click="registerFunc">register</span>
            </div>
            <div class="tip">
                <p>have account?<span class="login-link" @click="toDoLogin">login</span></p>
            </div>
        </div>
        <div class="feature-icons">
            <i class="fa-solid fa-dumbbell"></i>
            <i class="fa-solid fa-running"></i>
            <i class="fa-solid fa-biking"></i>
        </div>
    </div>
</template>

<script>
const DELAY_TIME = 1300;
import request from "@/utils/request.js";
import md5 from 'js-md5';
import Logo from '@/components/Logo.vue';
export default {
    name: "Register",
    components: { Logo },
    data() {
        return {
            act: '', // 账号
            pwd: '', // 密码
            pwdConfirm: '', // 确认密码
            name: '' // 用户名
        }
    },
    methods: {
        // 返回登录页面
        toDoLogin() {
            this.$router.push('/login');
        },
        async registerFunc() {
            if (!this.act || !this.pwd || !this.pwdConfirm || !this.name) {
                this.$swal.fire({
                    title: 'fill check',
                    text: 'account or password or user name cannot be empty',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: DELAY_TIME,
                });
                return;
            }
            if (this.pwd !== this.pwdConfirm) {
                this.$swal.fire({
                    title: 'fill check',
                    text: 'password input inconsistent',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: DELAY_TIME,
                });
                return;
            }
            const hashedPwd = md5(md5(this.pwd));
            const paramDTO = { userAccount: this.act, userPwd: hashedPwd, userName: this.name };
            try {
                const { data } = await request.post(`user/register`, paramDTO);
                if (data.code !== 200) {
                    this.$swal.fire({
                        title: 'register failed',
                        text: data.msg,
                        icon: 'error',
                        showConfirmButton: false,
                        timer: DELAY_TIME,
                    });
                    return;
                }
                // 使用Swal通知注册成功，延迟后跳转
                this.$swal.fire({
                    title: 'register success',
                    text: 'will return to login page...',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: DELAY_TIME,
                });
                // 根据角色延迟跳转
                setTimeout(() => {
                    this.$router.push('/login');
                }, DELAY_TIME);
            } catch (error) {
                console.error('register request exception:', error);
            }
        }
    }
};
</script>

<style lang="scss" scoped>

* {
    user-select: none;
    font-family: 'Inter', sans-serif;
}

.register-container {
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: relative;

    .bg-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgb(255,255,255);
    }

    .register-panel {
        margin: 0 auto;
        width: 350px;
        height: auto;
        padding: 40px 30px 30px 30px;
        border-radius: 20px;
        background-color: rgba(255, 255, 255, 0.95);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        z-index: 1;
        animation: fadeInUp 0.8s ease-out;

        .logo-section {
            text-align: center;
            margin-bottom: 30px;

            .slogan {
                color: #28a745;
                font-size: 18px;
                margin-top: 10px;
            }
        }

        .input-group {
            position: relative;
            margin-bottom: 20px;

            i {
                position: absolute;
                top: 50%;
                left: 15px;
                transform: translateY(-50%);
                color: #28a745;
            }

            .input-field {
                height: 50px;
                line-height: 50px;
                width: 100%;
                padding: 0 15px 0 45px;
                background-color: rgba(255, 255, 255, 0.9);
                box-sizing: border-box;
                border: 1px solid #ccc;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                transition: all 0.3s ease;

                &:focus {
                    outline: none;
                    border-color: #28a745;
                    box-shadow: 0 0 10px rgba(40, 167, 69, 0.3);
                }
            }
        }

        .button-group {
            margin-top: 30px;
        }

        .register-button {
            display: block;
            text-align: center;
            border-radius: 8px;
            height: 50px;
            line-height: 50px;
            width: 100%;
            background-color: #28a745;
            font-size: 18px;
            font-weight: 600;
            border: none;
            color: #fff;
            padding: 0;
            cursor: pointer;
            user-select: none;
            transition: all 0.3s ease;

            &:hover {
                background-color: #218838;
                transform: scale(1.05);
            }
        }

        .tip {
            margin: 20px 0 0 0;
            text-align: center;

            p {
                padding: 3px 0;
                font-size: 14px;
                margin: 0;
                color: #666;

                .login-link {
                    color: #28a745;
                    border-radius: 2px;
                    margin: 0 6px;
                    transition: color 0.3s ease;

                    &:hover {
                        color: #218838;
                        cursor: pointer;
                    }
                }
            }
        }
    }

    .feature-icons {
        position: absolute;
        bottom: 30px;
        display: flex;
        gap: 20px;

        i {
            color: rgba(255, 255, 255, 0.8);
            font-size: 36px;
            animation: bounce 2s infinite;
        }

        i:nth-child(2) {
            animation-delay: 0.3s;
        }

        i:nth-child(3) {
            animation-delay: 0.6s;
        }
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-15px);
    }
    60% {
        transform: translateY(-10px);
    }
}
</style>    