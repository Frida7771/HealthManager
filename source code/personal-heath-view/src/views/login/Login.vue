<template>
    <div class="login-container">
        <div class="header">
            <Logo :bag="colorLogo" bag="rgb(51,51,51)" sysName="health" />
        </div>
        <div class="login-panel">
            <div class="left-image">
                <img src="/bag.png" class="health-image" />
                <div class="motivational-text">
                    <p>every day a little step, health a big step</p>
                    <p>make exercise a habit</p>
                </div>
            </div>
            <div class="right-login">
                <div class="welcome-section">
                    <h2>welcome back!</h2>
                    <p class="subtitle">start your healthy life journey</p>
                </div>
                <div class="input-group">
                    <input v-model="act" class="act" placeholder="input account" />
                    <span class="input-icon">👤</span>
                </div>
                <div class="input-group">
                    <input v-model="pwd" class="pwd" type="password" placeholder="input password" />
                    <span class="input-icon">🔒</span>
                </div>
                <div>
                    <button class="login-btn" @click="login">login</button>
                </div>
                <div class="tip">
                    <p>no account?<span class="no-act" @click="toDoRegister">register</span></p>
                </div>
            </div>
        </div>
        <div class="footer-motivation">
            <p>life is in motion · health is from persistence</p>
        </div>
    </div>
</template>

<script>
const DELAY_TIME = 1300;
import request from "@/utils/request.js";
import { setToken } from "@/utils/storage.js";
import md5 from 'js-md5';
import Logo from '@/components/Logo.vue';
export default {
    name: "Login",
    components: { Logo },
    data() {
        return {
            act: '',
            pwd: '',
            colorLogo: 'rgb(38,38,38)',
        }
    },
    methods: {
        // 跳转注册页面
        toDoRegister() {
            // 跳转
            this.$router.push('/register');
        },
        async login() {
            if (!this.act || !this.pwd) {
                this.$swal.fire({
                    title: 'fill check',
                    text: 'account or password cannot be empty',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: DELAY_TIME,
                });
                return;
            }
            const hashedPwd = md5(md5(this.pwd));
            const paramDTO = { userAccount: this.act, userPwd: hashedPwd };
            try {
                const { data } = await request.post(`user/login`, paramDTO);
                if (data.code !== 200) {
                    this.$swal.fire({
                        title: 'login failed',
                        text: data.msg,
                        icon: 'error',
                        showConfirmButton: false,
                        timer: DELAY_TIME,
                    });
                    return;
                }
                setToken(data.data.token);
                // 根据角色延迟跳转
                setTimeout(() => {
                    const { role } = data.data;
                    sessionStorage.setItem('role', role);
                    this.navigateToRole(role);
                }, DELAY_TIME);
            } catch (error) {
                console.error('login request exception:', error);
                this.$message.error('login request exception, please try again!');
            }
        },
        navigateToRole(role) {
            switch (role) {
                case 1:
                    this.$router.push('/admin');
                    break;
                case 2:
                    this.$router.push('/user');
                    break;
                default:
                    console.warn('unknown role type:', role);
                    break;
            }
        },
    }
};
</script>

<style lang="scss" scoped>
* {
    user-select: none;
    box-sizing: border-box;
}

.login-container {
    width: 100%;
    min-height: 100vh;
    background-color: #f8fafc;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(74, 194, 154, 0.1) 0%, rgba(67, 176, 242, 0.1) 100%);
        z-index: 0;
    }

    .header {
        display: flex;
        justify-content: left;
        margin: 20px 0;
        width: 100%;
        max-width: 1200px;
        padding: 0 20px;
        z-index: 1;
    }

    .login-panel {
        display: flex;
        justify-content: space-between;
        height: auto;
        border-radius: 16px;
        background: white;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        z-index: 1;
        width: 800px;
        max-width: 90%;
        position: relative;

        &::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 5%;
            width: 90%;
            height: 10px;
            background: linear-gradient(to right, #4ac29a, #67b0f2);
            border-radius: 0 0 16px 16px;
            filter: blur(10px);
            opacity: 0.6;
        }

        .left-image {
            width: 45%;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: linear-gradient(to bottom right, #4ac29a, #67b0f2);
            color: white;

            .health-image {
                width: 100%;
                max-width: 160px;
                border-radius: 10px;
                animation: float 3s ease-in-out infinite;
            }

            .motivational-text {
                margin-top: 30px;
                text-align: center;

                p {
                    font-size: 18px;
                    font-weight: 500;
                    margin: 10px 0;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
            }
        }

        .right-login {
            width: 55%;
            padding: 50px;
            display: flex;
            flex-direction: column;
            justify-content: center;

            .welcome-section {
                margin-bottom: 30px;

                h2 {
                    color: #2d3748;
                    font-size: 28px;
                    margin-bottom: 8px;
                    font-weight: 700;
                }

                .subtitle {
                    color: #718096;
                    font-size: 14px;
                    font-weight: 400;
                }
            }

            .input-group {
                position: relative;
                margin: 15px 0;

                .input-icon {
                    position: absolute;
                    left: 15px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 18px;
                    color: #a0aec0;
                }
            }
        }
    }

    .act,
    .pwd {
        height: 50px;
        width: 100%;
        font-size: 16px;
        padding: 0 15px 0 45px;
        background-color: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        transition: all 0.3s ease;
        color: #4a5568;
        font-weight: 500;

        &:focus {
            outline: none;
            border-color: #4ac29a;
            box-shadow: 0 0 0 3px rgba(74, 194, 154, 0.2);
        }

        &::placeholder {
            color: #a0aec0;
            font-weight: 400;
        }
    }

    .login-btn {
        display: inline-block;
        text-align: center;
        border-radius: 8px;
        margin-top: 25px;
        height: 50px;
        line-height: 50px;
        width: 100%;
        background: linear-gradient(to right, #4ac29a, #67b0f2);
        font-size: 16px;
        font-weight: 600;
        border: none;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(74, 194, 154, 0.2);

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(74, 194, 154, 0.3);
        }

        &:active {
            transform: translateY(0);
        }
    }

    .tip {
        margin: 25px 0 0;
        text-align: center;

        p {
            padding: 3px 0;
            margin: 0;
            font-size: 14px;
            color: #718096;

            .no-act {
                color: #4ac29a;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;

                &:hover {
                    color: #3aa884;
                    text-decoration: underline;
                }
            }
        }
    }

    .footer-motivation {
        margin: 20px 0;
        color: #718096;
        font-size: 14px;
        font-weight: 500;
        z-index: 1;
    }
}

@keyframes float {
    0% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-10px);
    }

    100% {
        transform: translateY(0px);
    }
}

@media (max-width: 768px) {
    .login-panel {
        flex-direction: column;

        .left-image,
        .right-login {
            width: 100% !important;
        }

        .left-image {
            padding: 30px !important;

            .health-image {
                max-width: 200px !important;
            }
        }
    }
}
</style>