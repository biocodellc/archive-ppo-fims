#!/bin/bash
# A sample script to show how to get output into VUE format
rapper -i turtle -o dot output-1row.ttl | dot2vue > output-1row.vue
