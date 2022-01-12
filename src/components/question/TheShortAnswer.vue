<template>
    <div class="frame">
        <div class="container" :style="{ left: containerLeftPercentage + '%' }">
            <el-form class="answering-area">
                <el-form-item class="question">
                    <p>
                        <slot></slot>
                    </p>
                </el-form-item>
                <el-form-item class="answer">
                    <el-input :disabled="isEntered" v-model="userAnswer" type="textarea" placeholder="Your answer..."></el-input>
                </el-form-item>
                <el-form-item class="submit">
                    <div class="btn-container">
                        <el-button
                            type="primary"
                            :icon="CircleCheck"
                            :disabled="userAnswer.length === 0 || isEntered"
                            @click="enter()"
                        >Check</el-button>
                    </div>
                </el-form-item>
            </el-form>
            <div class="checking-area">
                <p class="tip">Please compare your answer with the sample one.</p>
                <div class="comparison">
                    <div class="your-answer">
                        <el-card class="field">
                            <template #header>
                                <span>Your answer</span>
                            </template>
                            {{userAnswer}}
                        </el-card>
                    </div>
                    <div class="sample-answer">
                        <el-card class="field">
                            <template #header>
                                <span>Sample answer</span>
                            </template>
                            {{correctAnswer}}
                        </el-card>
                    </div>
                </div>
                <div class="judging-controlbox">
                    <el-button type="danger" :disabled="result!=='unknown'" @click="userJudge('incorrect')">Wrong</el-button>
                    <el-button type="warning" :disabled="result!=='unknown'" @click="userJudge('partly correct')">Partly Right</el-button>
                    <el-button type="success" :disabled="result!=='unknown'" @click="userJudge('correct')">Exactly Right</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.frame {
    overflow: hidden;
    position: relative;
    width: 100%;
    height: 100%;
    .container {
        position: absolute;
        width: 200%;
        height: 100%;
        display: flex;
        .answering-area,.checking-area {
            box-sizing: border-box;
            width: 50%;
            height: 100%;
            padding: 18px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .answering-area {
            .submit {
                position: relative;
                margin-top: 18px;
                .btn-container {
                    position: absolute;
                    right: 0;
                }
            }
        }
        .checking-area {
            .tip {
                line-height: 3;
                font-size: 1.2rem;
                text-align: center;
            }
            .comparison {
                .your-answer,
                .sample-answer {
                    width: 49.5%;
                    float: left;
                }
                .your-answer {
                    margin-right: 1%;
                }
                margin-bottom: 10px;
            }

            .judging-controlbox {
                text-align: center;
                margin-top: auto;
                margin-bottom: 10px;
            }
        }
    }
}
</style>

<script lang="ts" setup>
import { ref, defineEmits, reactive } from 'vue'
import { CircleCheck } from '@element-plus/icons-vue'
/* essential stuff */
const result = ref<'unknown' | 'correct' | 'incorrect' | 'partly correct'>('unknown');
const props = defineProps({
    correctAnswer: {
        type: String,
        required: true
    }
});
const emit = defineEmits(['feedback']);

const bingo = () => { if (!localStorage.disableSoundEffect) new Audio(`/sounds/correct.wav`).play(); }

function userJudge(choice: "correct" | "partly correct" | "incorrect") {
    result.value = choice
    if (choice==="correct") bingo();
    emit("feedback", {
        result: choice,
        userAnswer: userAnswer.value
    })
}

function registerHotkeys() {

}
function unregisterHotkeys() {

}

/* processing user input */
const userAnswer = ref('');
const isEntered = ref(false);

function enter() {
    isEntered.value = true;
    // the user's answer is the same as the sample
    if (userAnswer.value === props.correctAnswer) {
        result.value = "correct";
        bingo();
        emit("feedback", {
            result: result.value,
            userAnswer: userAnswer.value
        });
    } else {
        slide();
    }
}

/* page sliding transition */
const containerLeftPercentage = ref(0);
const timer = ref<number | undefined>(undefined);

function slide() {
    timer.value = setInterval(() => {
        if (containerLeftPercentage.value > -100)
            containerLeftPercentage.value -= 5;
        else
            clearInterval(timer.value);
    }, 10);
}
</script>
