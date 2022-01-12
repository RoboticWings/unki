<template>
  <div class="test-view">
    <MultipleChoice v-if="$route.params.name==='mc'" ref="mc" c1="2" c2="10" c3="5" c4="7" @feedback="ans" :correct-answer="2">1+1=?</MultipleChoice>
    <TrueFalse ref="tf" @feedback="ans" v-if="$route.params.name==='tf'" :correct-answer="true">每呼吸60秒，就相当于失去了一分钟的寿命。</TrueFalse>
    <ShortAnswer correctAnswer="haha" v-if="$route.params.name==='sa'" @feedback="ans">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quisquam vel tempora hic sit doloribus molestiae nam vero voluptatibus rem accusamus, delectus officia consectetur perspiciatis omnis explicabo ipsum veniam? Cum, est.</ShortAnswer> 
  </div>
</template>
 

<script lang="ts">
import MultipleChoice from '@/components/question/TheMultipleChoice.vue';
import TrueFalse from '@/components/question/TheTrueFalse.vue'
import {Options, Vue} from 'vue-class-component'
import ShortAnswer from '@/components/question/TheShortAnswer.vue'

@Options({
  components: {
    MultipleChoice,
    TrueFalse,
    ShortAnswer
  },
  mounted() {
/*     const f = this.$refs.tf.registerHotkeys;
    if (f) f();
 */  },
  methods: {
    ans(data: any) {
      alert(`用户答案：${data.userAnswer}\n结果：${data.result}`);
    }
  }  
})

export default class TestView extends Vue {
  ans: any
}

</script>

<style>
  .test-view {
    max-width: 1200px;
    margin: auto;
  }
</style>