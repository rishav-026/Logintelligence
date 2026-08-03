import time
from contextlib import contextmanager

@contextmanager
def measure_execution_time():
    """
    Context manager to measure execution time in milliseconds.
    Usage:
        with measure_execution_time() as timer:
            do_something()
        print(timer['elapsed_ms'])
    """
    start_time = time.perf_counter()
    timer = {'elapsed_ms': 0.0}
    try:
        yield timer
    finally:
        end_time = time.perf_counter()
        timer['elapsed_ms'] = round((end_time - start_time) * 1000, 2)
