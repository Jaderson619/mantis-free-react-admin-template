original_lines = open('original_list.jsx').readlines()
current_lines = open('src/pages/products/list.jsx').readlines()

# The current_lines got truncated around a specific point.
# I just need to find where the <LinearProgress logic was in the original and stick it back.
cutoff_line = "<LinearProgress"

for i, line in enumerate(original_lines):
    if "variant=\"determinate\"" in line and "<LinearProgress" in original_lines[i-1]:
        # found the cutoff point in original!
        rest_of_file = original_lines[i+1:]
        break

# Truncate current_lines to right after <LinearProgress
new_current = []
for line in current_lines:
    new_current.append(line)
    if "variant=\"determinate\"" in line:
        break

open('src/pages/products/list.jsx', 'w').writelines(new_current + rest_of_file)
