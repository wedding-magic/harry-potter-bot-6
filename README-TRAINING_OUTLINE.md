# Outline for training custom chatGPT

## 1. Train base GPT language model

The first step for training a custom version of ChatGPT would be to train a base GPT language model using a similar transformer architecture to GPT-3 https://arxiv.org/abs/2005.14165.

### i) scrape and clean training dataset:

I would want a large, high quality corpus of text for training the model, e.g. OpenAI OpenWebText2 https://openwebtext2.readthedocs.io/en/latest/ (publicly available version of OpenAI's dataset of reddit submissions from 2005-2020). The advantage of using reddit posts is the built-in quality filter (i.e. you can filter the raw data by submissions that receive a certain score). High quality training data is important to the performance of the trained model. To save work I might use the public available Plug and Play Version of OpenWebText2 which has already been cleaned and filtered for quality, or if I wanted to filter/clean it differently (e.g. use a higher quality threshold) I could download the raw scrapes and filter it myself.

I would also use a web crawler to scrape data from similar websites with high quality question-answering text like Stackoverflow or Quora, filter by their quality metrics and add the text to the training dataset (or more practically use publically available datasets). If I was scraping data myself as opposed to using precleaned datasets it would be important to use a library for removing extraneous characters and formatting. I might also add wikipedia articles from e.g. https://huggingface.co/datasets/wikipedia to the dataset.

Another data cleaning consideration in addition to filtering for quality would be deduplicating the data (i.e. getting rid of duplicate examples and long repetitive substrings. This has a big effect on model quality because duplicated data will cause the language model to output memorized text more often, and also contribute to train-test overlap, which makes model evaluation less accurate (see https://arxiv.org/abs/2107.06499). Deduplication could be implemented by eliminating scraped text data from equivalent URL's, and also by eliminating similar documents using the MinHash algorithm https://en.wikipedia.org/wiki/MinHash. If I was combining multiple datasets (e.g. reddit and StackOverflow) it would be important to eliminate duplicate content between the sources.

### ii) prepare dataset for training

The next step would be to prepare the dataset for training, first by splitting it into a train and test set for training and evaluation respectively, e.g. using Huggingface datasets library ```train_test_split``` method https://huggingface.co/docs/datasets/v2.11.0/en/package_reference/main_classes#datasets.Dataset.train_test_split and setting the ```test_size ``` parameter to determine the fraction of the dataset held out for evaluation.

After splitting into train and test, the next step would be to tokenize the dataset, using a byte pair encoding function (e.g. from the tiktoken library https://github.com/openai/tiktoken) to map the text to a sequence of integer tokens for training.

### iii) training/evaluation

For training we would load the tokenized data into a pytorch tensor with dimensions according to the batch size and block size parameters, and set additional parameters e.g. training steps and learning rate, which would require some tuning based on dataset size and quality. 

I would then run a training loop on a GPU cluster sampling ```batch_size ``` number of blocks in parallel of length ```block_size``` and using the multi-headed attention mechanism and backpropogation to update weights using something similar to https://github.com/karpathy/nanoGPT/blob/master/train.py (reproduction of GPT-2). 

It would be important to periodically evaluate the loss on the test set in addition to the training set to check for overfitting, and save model checkpoints along the way to return to and dynamically adjust learning rate if overfitting is detected (lower learning rate => less overfitting). Checkpoints could also be used for tuning other parameters based on evaluation on the test set to further optimize the model.

## 2. finetuning for desired chatbot behavior

Once I had the base language model, the next step would be to use finetuning or RLHF to train the base language model to behave like a question-answering chatbot.

I would likely use finetuning as opposed to RLHF for practical reasons because it requires less data/compute. Likewise it would be a more practical option instead of training a base model from scratch to download the weights for a publically available base model such as lit-llama instead https://github.com/Lightning-AI/lit-llama and then finetune it for chatbot behavior.

The finetuning process would be similar to the training process described above but shorter and with a lower learning rate. I would likely use the LoRA method for finetuning (https://arxiv.org/abs/2106.09685) to reduce the amount of model parameters you need to retrain (example code here https://github.com/Lightning-AI/lit-llama/blob/main/finetune_lora.py). 

For the finetuning dataset I would use the alpaca dataset from huggingface https://huggingface.co/datasets/tatsu-lab/alpaca which is generated using ```text-davinci-003 ```to provide training prompts and outputs to align the model towards answering questions. Using ```text-davinci-003``` to generate the data allows the finetuning process to capture the effect of the RLHF used by OpenAI to create the model without having to do it ourselves. I could also combine my own training data generated by ```text-davinci-003``` with the alpaca dataset in the format of ```{instruction:..., input:..., output:...}``` if I wanted to finetune for more specific behavior (e.g. acting like an NPC in a videogame.)







