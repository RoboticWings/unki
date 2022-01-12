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
            <div class="option" :key="n" v-for="n in 4">
                <el-button
                    @click="judge(n)"
                    class="btn-option"
                    :disabled="result !== 'unknown'"
                >{{ "1️⃣2️⃣3️⃣4️⃣".slice(3 * n - 3, 3 * n - 1) }}&nbsp;&nbsp;{{ getOptionText(n) }}</el-button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.container {
    height: 100%;
    counter-reset: n;
    .description-area {
        height: 61.8%;
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
        height: 38.2%;
        display: grid;
        grid-template-columns: 50% 50%;
        grid-template-rows: 50% 50%;
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
        c1: {
            type: String,
            required: true,
        },
        c2: {
            type: String,
            required: true
        },
        c3: {
            type: String,
            required: true
        },
        c4: {
            type: String,
            required: true
        },
        correctAnswer: {
            type: Number,
            required: true,
            validator: function (val: number) {
                return [1, 2, 3, 4].includes(val);
            }
        },
        feedback: {
            type: Function,
            required: true
        }
    },
    methods: {
        bingo() { if (!localStorage.disableSoundEffect) new Audio(`/sounds/correct.wav`).play(); },
        judge(id: number) {
            const noSound = localStorage.disableSoundEffect;
            if (id === this.$props.correctAnswer) {
                this.result = "correct";
                this.bingo();
            }
            else
                this.result = "incorrect";
            setTimeout(() => {
                this.$emit('feedback',
                    {
                        userAnswer: this.getOptionText(id),
                        result: this.result
                    });
            }, 1000);
        },
        getOptionText(id: number): string {
            return this.$props['c' + id];
        },
        registerHotkeys() {
            [1, 2, 3, 4].forEach(x => {
                key(x.toString(), () => this.judge(x));
            })
        },
        unregisterHotkeys() {
            [1, 2, 3, 4].forEach(x => key.unbind(x.toString()));
        }
    }
})


export default class TheMultipleChoice extends Vue {
    c1!: string
    c2!: string
    c3!: string
    c4!: string
    result!: "unknown" | "correct" | "incorrect"
    judge!: (id: number) => void
    getOptionText!: (id: number) => string
}
</script>