<template>
    <div class="container">
        <div class="description-area">
            <p class="description">
                <slot></slot>
            </p>
            <div class="feedback" v-if="result !== 'unknown'">
                <p class="right" v-if="result === 'correct'">Correct!</p>
                <p class="wrong" v-else>Incorrect.</p>
            </div>
        </div>
        <div class="options-area">
            <div class="option">
                <el-button
                    @click="judge(true)"
                    class="btn-option"
                    :disabled="result !== 'unknown'"
                >✔️&nbsp;&nbsp;TRUE</el-button>
            </div>
            <div class="option">
                <el-button
                    @click="judge(false)"
                    class="btn-option"
                    :disabled="result !== 'unknown'"
                >❌&nbsp;&nbsp;FALSE</el-button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.container {
    height: 100%;
    .description-area {
        height: 70%;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        text-align: center;
        .description {
            font-size: 2rem;
        }
        .feedback {
            position: absolute;
            font-size: 1.3rem;
            height: 16px;
            justify-self: flex-end;
            bottom: 10px;
            font-weight: bold;
            .right {
                color: limegreen;
            }
            .wrong {
                color: orangered;
            }
        }
    }
    .options-area {
        height: 30%;
        display: grid;
        grid-template-columns: 50% 50%;
        box-sizing: border-box;
        padding: 20px 0 0 20px;
        .option {
            .btn-option {
                font-size: 1.3rem;
                margin-left: 0px;
                width: 100%;
                text-align: left;
                height: 100%;
                min-height: 32px;
            }
            padding: 0px 20px 20px 0px;
        }
    }
}
</style>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import key from 'keymaster';

@Options({
    data() {
        return {
            result: "unknown"
        }
    },
    props: {
        correctAnswer: {
            type: Boolean,
            required: true,
        },
        feedback: {
            type: Function,
            // required: true
        }
    },
    methods: {
        bingo () { if (!localStorage.disableSoundEffect) new Audio(`/sounds/correct.wav`).play(); },
        judge(userAnswer: boolean) {
            // judge whether user answer is right
            if (userAnswer === this.$props.correctAnswer) {
                this.result = "correct";
                this.bingo();
            }
            else
                this.result = "incorrect";
            // call the feedback function in 1 sec
            setTimeout(() => {
                this.$emit('feedback',
                    {
                        userAnswer,
                        result: this.result
                    });
            }, 1000);
        },
        registerHotkeys() {
            key.bind("1", () => this.judge(true));
            key.bind("2", () => this.judge(false));
        },
        unregisterHotkeys() {
            key.unbind("1");
            key.unbind("2");
        }
    }
})


export default class TheTrueFalse extends Vue {
    result!: "unknown" | "correct" | "incorrect"
    judge!: (ans: boolean) => void
}
</script>