import java.util.*;

class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for(int i : nums){
            freq.put(i, freq.getOrDefault(i, 0) + 1);
        }

        List<Map.Entry<Integer, Integer>> res = new LinkedList<>(freq.entrySet());
        res.sort((a, b) -> b.getValue() - a.getValue());
        int[] topK = new int[k];
        for(int i=0; i<k; i++){
            topK[i] = res.get(i).getKey();
        }
        return topK;
    }
}