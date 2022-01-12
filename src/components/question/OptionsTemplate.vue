<template>
    <div class="container">

    </div>
</template>

<style lang="scss" scoped>
.container {
    height: 100%;
}
</style>

<script lang="ts">
import {Options, Vue} from 'vue-class-component'
import key from 'keymaster'

@Options({
    data() {
        return {
            result: 'unknown'
        }
    },
    props: {
        correctAnswer: {
            // type: String
            required: true
        },
        feedback: {
            type: Function,
            required: true
        }
    },
    methods: {
        judge(userAnswer: any) {
            // judge whether user answer is right
            
            // call the feedback function 1 sec
            setTimeout(() => {
                this.$emit('feedback',
                    {
                        userAnswer,
                        result: this.result
                    }
                )
            }, 1000);
        },
        registerHotkeys() {

        },
        unregisterHotkeys() {

        }
    }
})

export default class TheTrueFalse extends Vue {
    result!: "unknown" | "correct" | "incorrect" // | "partly correct"
    judge!: (correctAnswer: boolean) => void
}
</script>