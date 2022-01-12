<template>
    <div class="container"></div>
</template>

<style lang="scss" scoped>
.container {
    height: 100%;
}
</style>

<script lang="ts" setup>
import { ref, defineEmits } from 'vue'

const result = ref<'unknown' | 'correct' | 'incorrect' | 'partly correct'>('unknown');
const props = defineProps({
    correctAnswer: {
        // type: String
        required: true
    },
    feedback: {
        type: Function,
        required: true
    }
});
const emit = defineEmits(['feedback']);
function judge(userAnswer: any) {
    const bingo = () => { if (!localStorage.disableSoundEffect) new Audio(`/sounds/correct.wav`).play(); }

    // judge whether user answer is right

    // call the feedback function 1 sec
    setTimeout(() => {
        emit('feedback',
            {
                userAnswer,
                result
            }
        )
    }, 1000);
}
function registerHotkeys() {

}
function unregisterHotkeys() {

}
</script>