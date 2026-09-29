
import java.util.*;
class Solution {
    public boolean isAnagram(String s, String t) {
        Map<Character, Integer> map = new HashMap<>();
        char[] s1 = s.trim().toCharArray();
        char[] t1 = t.trim().toCharArray();
        if(s1.length != t1.length){
            return false;
        }

        for(int i=0; i<s1.length; i++){
            map.put(s1[i], map.getOrDefault(s1[i], 0) + 1);
        }

        for(int i=0; i<t1.length; i++){
            map.put(t1[i], map.getOrDefault(t1[i], 0) - 1);
        }

        for(Map.Entry<Character, Integer> e : map.entrySet()){
            if(e.getValue() != 0)
            return false;
        }
        return true;
    }
}